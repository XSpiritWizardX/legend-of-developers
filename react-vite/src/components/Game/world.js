export const TILE = 48;

export const MAPS = {
  overworld: {
    id: "overworld",
    name: "The Vale of Emberfall",
    width: 80,
    height: 60,
    spawn: { x: 38 * TILE, y: 43 * TILE },
    dungeonEntrance: { x: 39 * TILE, y: 8 * TILE },
    enemies: [
      ["ow-slime-1", "slime", 34, 42], ["ow-slime-2", "slime", 42, 41],
      ["ow-slime-3", "slime", 28, 35], ["ow-slime-4", "slime", 51, 36],
      ["ow-bat-1", "bat", 20, 26], ["ow-bat-2", "bat", 58, 24],
      ["ow-guard-1", "guard", 37, 12], ["ow-guard-2", "guard", 42, 12],
    ],
    chests: [
      ["ow-chest-boomerang", 31, 38, "boomerang"],
      ["ow-chest-bombs", 55, 31, "bombs"],
      ["ow-chest-heart", 18, 20, "heart"],
    ],
  },
  emberCrypt: {
    id: "emberCrypt",
    name: "Dungeon I · Ember Crypt",
    width: 28,
    height: 22,
    spawn: { x: 14 * TILE, y: 19 * TILE },
    exit: { x: 14 * TILE, y: 20 * TILE },
    enemies: [
      ["d1-guard-1", "guard", 9, 16], ["d1-guard-2", "guard", 19, 16],
      ["d1-bat-1", "bat", 7, 10], ["d1-bat-2", "bat", 21, 10],
      ["d1-slime-1", "slime", 11, 6], ["d1-slime-2", "slime", 17, 6],
      ["d1-boss", "boss", 14, 3],
    ],
    chests: [
      ["d1-key", 5, 13, "key"],
      ["d1-map", 23, 13, "dungeonMap"],
      ["d1-heart", 14, 3, "heart"],
    ],
  },
};

export function tileAt(mapId, tx, ty, flags = {}) {
  const map = MAPS[mapId];
  if (tx < 0 || ty < 0 || tx >= map.width || ty >= map.height) return "void";

  if (mapId === "emberCrypt") {
    if (tx === 0 || ty === 0 || tx === map.width - 1 || ty === map.height - 1) return "wall";
    if (tx === 3 && ty === 5) return flags.crackedWallOpen ? "dungeonFloor" : "crackedWall";
    if ((ty === 14 && tx !== 14) || (ty === 8 && tx > 3 && tx < 24 && tx !== 14)) return "wall";
    if (ty === 8 && tx === 14 && !flags.dungeonDoorOpen) return "lockedDoor";
    if ((tx === 3 || tx === 24) && ty > 3 && ty < 18) return "wall";
    return (tx + ty) % 2 ? "dungeonFloor" : "dungeonFloorAlt";
  }

  // The overworld is a large hand-shaped landscape generated from regions.
  if (tx < 2 || ty < 2 || tx >= map.width - 2 || ty >= map.height - 2) return "mountain";
  if (ty < 7 || (ty < 12 && (tx < 29 || tx > 50))) return "mountain";
  if (tx > 7 && tx < 18 && ty > 13 && ty < 48) return "water";
  if (tx > 61 && tx < 72 && ty > 9 && ty < 43) return "water";
  if (ty > 25 && ty < 29 && tx > 17 && tx < 62) {
    if (tx >= 37 && tx <= 41) return "bridge";
    return "water";
  }
  if (ty >= 47 && tx > 24 && tx < 56) return "village";
  if ((tx > 22 && tx < 32 && ty > 15 && ty < 25) || (tx > 48 && tx < 60 && ty > 32 && ty < 45)) return "forest";
  if (ty < 16 && tx > 31 && tx < 48) return "stone";
  return (tx * 7 + ty * 11) % 5 ? "grass" : "grassAlt";
}

export function isSolid(tile) {
  return ["void", "mountain", "water", "wall", "lockedDoor", "crackedWall"].includes(tile);
}
