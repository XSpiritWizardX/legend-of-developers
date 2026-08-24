import { TERRAIN } from "./terrainInteractions";

export const WILLOWBROOK_SHOWCASE = Object.freeze({
  x: 16,
  y: 10,
  width: 32,
  height: 20,
});

const WILLOWBROOK_PITS = new Set([
  "21,22", "22,22", "24,22",
  "21,23", "23,23", "24,23",
  "22,24", "24,24", "25,24",
]);

function inRange(value, min, max) {
  return value >= min && value <= max;
}

function inWillowbrook(tx, ty) {
  return tx >= WILLOWBROOK_SHOWCASE.x
    && ty >= WILLOWBROOK_SHOWCASE.y
    && tx < WILLOWBROOK_SHOWCASE.x + WILLOWBROOK_SHOWCASE.width
    && ty < WILLOWBROOK_SHOWCASE.y + WILLOWBROOK_SHOWCASE.height;
}

function willowbrookTerrain(tx, ty) {
  if (!inWillowbrook(tx, ty)) return null;

  // Remove the old 16x10 screen seams inside the new 32x20 logical room so
  // Willowbrook reads as one continuous space while the camera follows.
  if ((tx === 31 || tx === 32) && inRange(ty, 10, 29)) return "village";
  if ((ty === 19 || ty === 20) && inRange(tx, 16, 47)) return "village";

  // Raised terrace immediately south of the starting position. Most of the
  // edge is a one-way drop; the eastern steps and ramp provide reversible
  // elevation transitions without weakening the authored cliff boundary.
  if (ty === 18 && inRange(tx, 18, 30)) {
    if (tx === 27 || tx === 28) return TERRAIN.STAIRS;
    if (tx === 29 || tx === 30) return TERRAIN.RAMP;
    if (inRange(tx, 20, 26)) return TERRAIN.LEDGE_DOWN;
    return "mountain";
  }

  // A compact pit garden makes falling/recovery visible without blocking the
  // main quest road. The gaps deliberately create a readable slalom route.
  if (WILLOWBROOK_PITS.has(`${tx},${ty}`)) return TERRAIN.PIT;

  // Stone approach and landing strip make the showcase read as intentionally
  // authored terrain rather than random hazard tiles.
  if (ty === 17 && inRange(tx, 19, 30)) return "stone";
  if (ty === 21 && inRange(tx, 19, 29)) return "grassAlt";
  if ((tx === 26 || tx === 27) && inRange(ty, 22, 25)) return "stone";

  return null;
}

function oldgrowthTerrain(tx, ty) {
  if (!inRange(tx, 48, 63) || !inRange(ty, 0, 19)) return null;

  // A second ledge in Oldgrowth demonstrates that the traversal vocabulary is
  // reusable outside the starting village. Stairs keep it reversible.
  if (ty === 8 && inRange(tx, 51, 61)) {
    if (tx === 60 || tx === 61) return TERRAIN.STAIRS;
    return TERRAIN.LEDGE_DOWN;
  }
  return null;
}

export function showcaseTerrainAt(mapId, tx, ty) {
  if (mapId !== "overworld") return null;
  return willowbrookTerrain(tx, ty) || oldgrowthTerrain(tx, ty);
}

export function isShowcasePit(mapId, tx, ty) {
  return showcaseTerrainAt(mapId, tx, ty) === TERRAIN.PIT;
}
