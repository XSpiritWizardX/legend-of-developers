import { autotileArtId } from "./art/autotileCatalog";
import { editableRoomAt } from "./rooms/roomRegistry";

export const SCREEN_COLS = 16;
export const SCREEN_ROWS = 10;
const WORLD_COLS = 16;
const WORLD_ROWS = 16;

export function overworldBiomeFor(roomX, roomY) {
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

const EXIT_OVERRIDES = Object.freeze({
  "1,0": ["e", "s"], "2,0": ["w", "s"], "0,1": ["e"],
  "1,1": ["n", "s", "w", "e"], "2,1": ["w", "s"], "1,2": ["n", "e"],
  "2,2": ["n", "w", "e"], "3,2": ["n", "w", "e"], "3,1": ["n", "s"],
  "3,0": ["s"], "4,2": ["w", "e"], "5,2": ["w", "s"],
  "5,3": ["n", "e"], "6,3": ["w", "s"], "6,4": ["n", "s"],
  "6,5": ["n", "s"], "6,6": ["n", "e"], "7,6": ["w", "e"], "8,6": ["w"],
});

export function perimeterExitsFor(roomX, roomY) {
  return EXIT_OVERRIDES[`${roomX},${roomY}`] || generatedExits(roomX, roomY);
}

function isOpening(exits, lx, ly) {
  if (lx === 0 && exits.includes("w") && (ly === 4 || ly === 5)) return true;
  if (lx === SCREEN_COLS - 1 && exits.includes("e") && (ly === 4 || ly === 5)) return true;
  if (ly === 0 && exits.includes("n") && (lx === 7 || lx === 8)) return true;
  if (ly === SCREEN_ROWS - 1 && exits.includes("s") && (lx === 7 || lx === 8)) return true;
  return false;
}

export function generatedPerimeterCellAt(roomX, roomY, lx, ly) {
  if (roomX < 0 || roomY < 0 || roomX >= WORLD_COLS || roomY >= WORLD_ROWS) return false;
  if (lx < 0 || ly < 0 || lx >= SCREEN_COLS || ly >= SCREEN_ROWS) return false;
  if (editableRoomAt("overworld", roomX, roomY)?.walls?.length) return false;
  const edge = lx === 0 || ly === 0 || lx === SCREEN_COLS - 1 || ly === SCREEN_ROWS - 1;
  if (!edge) return false;
  return !isOpening(perimeterExitsFor(roomX, roomY), lx, ly);
}

export function perimeterMaskAt(roomX, roomY, lx, ly) {
  if (!generatedPerimeterCellAt(roomX, roomY, lx, ly)) return null;
  let mask = 0;
  if (generatedPerimeterCellAt(roomX, roomY, lx, ly - 1)) mask |= 1;
  if (generatedPerimeterCellAt(roomX, roomY, lx + 1, ly)) mask |= 2;
  if (generatedPerimeterCellAt(roomX, roomY, lx, ly + 1)) mask |= 4;
  if (generatedPerimeterCellAt(roomX, roomY, lx - 1, ly)) mask |= 8;
  return mask;
}

export function perimeterFamilyFor(roomX, roomY) {
  const biome = overworldBiomeFor(roomX, roomY);
  if (biome === "lake") return "coastShore";
  if (biome === "desert") return "desertCliff";
  if (biome === "stone") {
    if (roomY >= 12 && roomX >= 7) return "crystalWall";
    return "caveWall";
  }
  return "forestCliff";
}

export function worldPerimeterArtAt(mapId, tx, ty) {
  if (mapId !== "overworld") return null;
  const roomX = Math.floor(tx / SCREEN_COLS);
  const roomY = Math.floor(ty / SCREEN_ROWS);
  const lx = tx - roomX * SCREEN_COLS;
  const ly = ty - roomY * SCREEN_ROWS;
  const mask = perimeterMaskAt(roomX, roomY, lx, ly);
  if (mask === null) return null;
  return autotileArtId(perimeterFamilyFor(roomX, roomY), mask);
}
