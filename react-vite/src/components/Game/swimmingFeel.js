const WATER_TILES = new Set(["water", "deepWater"]);

export function isWaterTerrain(tile) {
  return WATER_TILES.has(tile);
}

export function isSwimming({ tile, hasFlippers }) {
  return Boolean(hasFlippers) && isWaterTerrain(tile);
}

export function swimMovementScale(swimming) {
  return swimming ? 0.72 : 1;
}

export function canDashWhileSwimming(swimming) {
  return !swimming;
}

export function swimVisual({ swimming, moving, time = 0 }) {
  if (!swimming) return null;
  const wave = Math.sin(time * (moving ? 8.5 : 4.5));
  return {
    bobY: wave * (moving ? 1.6 : 0.8),
    rippleX: 20 + wave * 2.2,
    rippleY: 7 + wave * 0.8,
    alpha: moving ? 0.72 : 0.5,
  };
}

export function swimTransition(previousSwimming, nextSwimming) {
  if (previousSwimming === nextSwimming) return null;
  return nextSwimming ? "enter" : "exit";
}
