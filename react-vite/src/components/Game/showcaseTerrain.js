import { TERRAIN } from "./terrainInteractions";
import { editableRoomAt } from "./rooms/roomRegistry";

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

const SCREEN_COLS = 16;
const SCREEN_ROWS = 10;
const WORLD_COLS = 16;
const WORLD_ROWS = 16;

function inRange(value, min, max) { return value >= min && value <= max; }
function inWillowbrook(tx, ty) {
  return tx >= WILLOWBROOK_SHOWCASE.x && ty >= WILLOWBROOK_SHOWCASE.y
    && tx < WILLOWBROOK_SHOWCASE.x + WILLOWBROOK_SHOWCASE.width
    && ty < WILLOWBROOK_SHOWCASE.y + WILLOWBROOK_SHOWCASE.height;
}

function willowbrookTerrain(tx, ty) {
  if (!inWillowbrook(tx, ty)) return null;
  if ((tx === 31 || tx === 32) && inRange(ty, 10, 29)) return "village";
  if ((ty === 19 || ty === 20) && inRange(tx, 16, 47)) return "village";
  if (ty === 18 && inRange(tx, 18, 30)) {
    if (tx === 27 || tx === 28) return TERRAIN.STAIRS;
    if (tx === 29 || tx === 30) return TERRAIN.RAMP;
    if (inRange(tx, 20, 26)) return TERRAIN.LEDGE_DOWN;
    return "mountain";
  }
  if (WILLOWBROOK_PITS.has(`${tx},${ty}`)) return TERRAIN.PIT;
  if (ty === 17 && inRange(tx, 19, 30)) return "stone";
  if (ty === 21 && inRange(tx, 19, 29)) return "grassAlt";
  if ((tx === 26 || tx === 27) && inRange(ty, 22, 25)) return "stone";
  return null;
}

function oldgrowthTerrain(tx, ty) {
  if (!inRange(tx, 48, 63) || !inRange(ty, 0, 19)) return null;
  if (ty === 8 && inRange(tx, 51, 61)) {
    if (tx === 60 || tx === 61) return TERRAIN.STAIRS;
    return TERRAIN.LEDGE_DOWN;
  }
  return null;
}

function biomeFor(roomX, roomY) {
  if (roomX <= 3 && roomY <= 3) {
    if ((roomX === 1 && roomY === 1) || (roomX === 2 && roomY === 2)) return "village";
    return roomX === 3 && roomY === 2 ? "lake" : "forest";
  }
  if (roomX >= 12) return roomY % 4 === 2 ? "lake" : "stone";
  if (roomY >= 12) return roomX < 7 ? "desert" : "stone";
  if (roomX >= 9 && roomY >= 7) return "desert";
  if (roomY <= 2 && roomX >= 7) return "stone";
  if ((roomX === 6 && roomY >= 3 && roomY <= 9)
    || (roomY === 6 && roomX >= 4 && roomX <= 10)) return "lake";
  if ((roomX + roomY) % 7 === 0) return "forest";
  return "grass";
}

function generatedExits(roomX, roomY) {
  const exits = [];
  if (roomY > 0 && (roomX % 3 === 1 || roomY % 4 === 0)) exits.push("n");
  if (roomY < WORLD_ROWS - 1 && (roomX % 3 === 1 || (roomY + 1) % 4 === 0)) exits.push("s");
  if (roomX > 0 && (roomY % 3 === 1 || roomX % 4 === 0)) exits.push("w");
  if (roomX < WORLD_COLS - 1 && (roomY % 3 === 1 || (roomX + 1) % 4 === 0)) exits.push("e");
  return exits;
}

const AUTHORED_EXIT_OVERRIDES = Object.freeze({
  "1,0": ["e", "s"], "2,0": ["w", "s"], "0,1": ["e"],
  "1,1": ["n", "s", "w", "e"], "2,1": ["w", "s"], "1,2": ["n", "e"],
  "2,2": ["n", "w", "e"], "3,2": ["n", "w", "e"], "3,1": ["n", "s"],
  "3,0": ["s"], "4,2": ["w", "e"], "5,2": ["w", "s"],
  "5,3": ["n", "e"], "6,3": ["w", "s"], "6,4": ["n", "s"],
  "6,5": ["n", "s"], "6,6": ["n", "e"], "7,6": ["w", "e"], "8,6": ["w"],
});

function opening(exits, lx, ly) {
  if (lx === 0 && exits.includes("w") && (ly === 4 || ly === 5)) return true;
  if (lx === SCREEN_COLS - 1 && exits.includes("e") && (ly === 4 || ly === 5)) return true;
  if (ly === 0 && exits.includes("n") && (lx === 7 || lx === 8)) return true;
  if (ly === SCREEN_ROWS - 1 && exits.includes("s") && (lx === 7 || lx === 8)) return true;
  return false;
}

const PERIMETER_PROFILES = Object.freeze({
  forest: ["forestWall", "forest", "mountain", "forest", "forestWall", "mountain"],
  grass: ["forestWall", "mountain", "forest", "forestWall", "mountain", "forest"],
  village: ["forestWall", "mountain", "forest", "mountain", "forestWall", "forest"],
  lake: ["mountain", "water", "forestWall", "mountain", "water", "forest"],
  desert: ["mountain", "wall", "crackedWall", "mountain", "wall", "mountain"],
  stone: ["mountain", "wall", "crackedWall", "mountain", "crackedWall", "wall"],
});

function authoredPerimeterTerrain(tx, ty) {
  const roomX = Math.floor(tx / SCREEN_COLS);
  const roomY = Math.floor(ty / SCREEN_ROWS);
  if (roomX < 0 || roomY < 0 || roomX >= WORLD_COLS || roomY >= WORLD_ROWS) return null;

  // Rooms with an explicit wall grid keep their hand-authored border. Asset-only
  // room files still receive the biome perimeter profile instead of falling back
  // to the old repeated forestWall/mountain row.
  const explicitRoom = editableRoomAt("overworld", roomX, roomY);
  if (explicitRoom?.walls?.length) return null;

  const lx = tx % SCREEN_COLS;
  const ly = ty % SCREEN_ROWS;
  const edge = lx === 0 || ly === 0 || lx === SCREEN_COLS - 1 || ly === SCREEN_ROWS - 1;
  if (!edge) return null;

  const key = `${roomX},${roomY}`;
  const exits = AUTHORED_EXIT_OVERRIDES[key] || generatedExits(roomX, roomY);
  if (opening(exits, lx, ly)) return null;

  const biome = biomeFor(roomX, roomY);
  const profile = PERIMETER_PROFILES[biome] || PERIMETER_PROFILES.grass;
  const sideOffset = ly === 0 ? 0 : lx === SCREEN_COLS - 1 ? 2 : ly === SCREEN_ROWS - 1 ? 4 : 1;
  const index = Math.abs((roomX * 11) + (roomY * 17) + (lx * 3) + (ly * 5) + sideOffset) % profile.length;
  return profile[index];
}

export function showcaseTerrainAt(mapId, tx, ty) {
  if (mapId !== "overworld") return null;
  return willowbrookTerrain(tx, ty) || oldgrowthTerrain(tx, ty) || authoredPerimeterTerrain(tx, ty);
}

export function isShowcasePit(mapId, tx, ty) {
  return showcaseTerrainAt(mapId, tx, ty) === TERRAIN.PIT;
}
