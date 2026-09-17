export const FAST_TRAVEL_ITEM = "mirror";
export const FAST_TRAVEL_TILE_SIZE = 64;

export const FAST_TRAVEL_DESTINATIONS = Object.freeze([
  Object.freeze({ id: "willowbrook", name: "Willowbrook Village", tx: 24, ty: 15 }),
  Object.freeze({ id: "heros-grove", name: "Hero's Grove", tx: 24, ty: 5 }),
  Object.freeze({ id: "rosewall", name: "Rosewall Hamlet", tx: 88, ty: 35 }),
  Object.freeze({ id: "silverwater", name: "Silverwater Gate", tx: 104, ty: 35 }),
  Object.freeze({ id: "moonstone", name: "Moonstone Keep", tx: 120, ty: 65 }),
  Object.freeze({ id: "crystalwater", name: "Crystalwater Approach", tx: 136, ty: 65 }),
]);

export function withFastTravelMirror(save) {
  const base = save && typeof save === "object" ? save : {};
  const savedPlayer = base.player && typeof base.player === "object" ? base.player : {};
  return {
    ...base,
    version: 3,
    mapId: base.mapId || "overworld",
    player: {
      ...savedPlayer,
      inventory: {
        ...(savedPlayer.inventory || {}),
        [FAST_TRAVEL_ITEM]: true,
      },
    },
  };
}

export function fastTravelDestination(destinationId) {
  return FAST_TRAVEL_DESTINATIONS.find((destination) => destination.id === destinationId) || null;
}

export function resolveFastTravelPoint(destination, {
  isOpen = () => true,
  tileSize = FAST_TRAVEL_TILE_SIZE,
  maxSearchRadius = 8,
} = {}) {
  if (!destination) return null;

  for (let searchRadius = 0; searchRadius <= maxSearchRadius; searchRadius += 1) {
    for (let oy = -searchRadius; oy <= searchRadius; oy += 1) {
      for (let ox = -searchRadius; ox <= searchRadius; ox += 1) {
        if (searchRadius && Math.abs(ox) !== searchRadius && Math.abs(oy) !== searchRadius) continue;
        const tx = destination.tx + ox;
        const ty = destination.ty + oy;
        if (tx < 1 || ty < 1 || !isOpen(tx, ty)) continue;
        return {
          x: tx * tileSize + tileSize / 2,
          y: ty * tileSize + tileSize / 2,
        };
      }
    }
  }

  return {
    x: destination.tx * tileSize + tileSize / 2,
    y: destination.ty * tileSize + tileSize / 2,
  };
}

export function isOverworldFastTravelActivation(save, key) {
  if (save?.mapId !== "overworld" || !save?.player?.inventory?.[FAST_TRAVEL_ITEM]) return false;
  const normalizedKey = String(key || "").toLowerCase();
  const slotIndex = normalizedKey === "j" ? 0 : (normalizedKey === "k" ? 1 : -1);
  if (slotIndex < 0) return false;
  return save?.player?.equippedSlots?.[slotIndex] === FAST_TRAVEL_ITEM;
}

export function buildFastTravelSave(save, destinationId, travelOptions = {}) {
  const destination = fastTravelDestination(destinationId);
  if (!destination) throw new Error(`Unknown fast travel destination: ${destinationId}`);

  const nextSave = withFastTravelMirror(save);
  const point = resolveFastTravelPoint(destination, travelOptions);
  return {
    ...nextSave,
    mapId: "overworld",
    player: {
      ...nextSave.player,
      ...point,
      dir: "down",
    },
  };
}
