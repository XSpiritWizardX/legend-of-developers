import { TILE, isSolid, tileAt } from "./world";
import { roomAssetSolidAt } from "./roomAssets";

export const FAST_TRAVEL_ITEM = "mirror";

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

function fastTravelTileOpen(tx, ty, flags = {}) {
  const centerX = tx * TILE + TILE / 2;
  const centerY = ty * TILE + TILE / 2;
  const radius = 18;
  const probes = [
    [centerX - radius, centerY - radius],
    [centerX + radius, centerY - radius],
    [centerX - radius, centerY + radius],
    [centerX + radius, centerY + radius],
    [centerX, centerY],
  ];

  return probes.every(([x, y]) => {
    const tileX = Math.floor(x / TILE);
    const tileY = Math.floor(y / TILE);
    return !isSolid(tileAt("overworld", tileX, tileY, flags))
      && !roomAssetSolidAt("overworld", x, y);
  });
}

export function resolveFastTravelPoint(destination, flags = {}) {
  if (!destination) return null;

  for (let searchRadius = 0; searchRadius <= 8; searchRadius += 1) {
    for (let oy = -searchRadius; oy <= searchRadius; oy += 1) {
      for (let ox = -searchRadius; ox <= searchRadius; ox += 1) {
        if (searchRadius && Math.abs(ox) !== searchRadius && Math.abs(oy) !== searchRadius) continue;
        const tx = destination.tx + ox;
        const ty = destination.ty + oy;
        if (tx < 1 || ty < 1) continue;
        if (!fastTravelTileOpen(tx, ty, flags)) continue;
        return {
          x: tx * TILE + TILE / 2,
          y: ty * TILE + TILE / 2,
        };
      }
    }
  }

  return {
    x: destination.tx * TILE + TILE / 2,
    y: destination.ty * TILE + TILE / 2,
  };
}

export function isOverworldFastTravelActivation(save, key) {
  if (save?.mapId !== "overworld" || !save?.player?.inventory?.[FAST_TRAVEL_ITEM]) return false;
  const normalizedKey = String(key || "").toLowerCase();
  const slotIndex = normalizedKey === "j" ? 0 : (normalizedKey === "k" ? 1 : -1);
  if (slotIndex < 0) return false;
  return save?.player?.equippedSlots?.[slotIndex] === FAST_TRAVEL_ITEM;
}

export function buildFastTravelSave(save, destinationId) {
  const destination = fastTravelDestination(destinationId);
  if (!destination) throw new Error(`Unknown fast travel destination: ${destinationId}`);

  const nextSave = withFastTravelMirror(save);
  const point = resolveFastTravelPoint(destination, nextSave.flags || {});
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
