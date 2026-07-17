export const TILE = 64;
export const SCREEN_COLS = 16;
export const SCREEN_ROWS = 10;

const OW_ROOMS = {
  "0,0": { name: "Legacy Code Wilds", biome: "forest", exits: ["e", "s"] },
  "1,0": { name: "Markup Foundry", biome: "grass", exits: ["w", "e", "s"] },
  "2,0": { name: "Data Stream Reservoir", biome: "lake", exits: ["w", "e", "s"] },
  "3,0": { name: "Cloud Platform", biome: "stone", exits: ["w", "s"] },
  "0,1": { name: "Deprecated District", biome: "forest", exits: ["n", "e"] },
  "1,1": { name: "New Dev Quarter", biome: "village", exits: ["n", "w", "e"] },
  "2,1": { name: "Framework Freeway", biome: "grass", exits: ["n", "w", "e"] },
  "3,1": { name: "Silicon Wastes", biome: "desert", exits: ["n", "w"] },
};

const DUNGEON_ROOMS = {
  "0,0": { exits: ["e", "s"], variant: 1 },
  "1,0": { exits: ["w", "e", "s"], variant: 2, boss: true },
  "2,0": { exits: ["w", "s"], variant: 3 },
  "0,1": { exits: ["n", "e", "s"], variant: 2, secret: true },
  "1,1": { exits: ["n", "s", "w", "e"], variant: 0, lockedNorth: true },
  "2,1": { exits: ["n", "w", "s"], variant: 1 },
  "0,2": { exits: ["n", "e"], variant: 3 },
  "1,2": { exits: ["n", "w", "e"], variant: 1, entrance: true },
  "2,2": { exits: ["n", "w"], variant: 2 },
};

export const DUNGEONS = [{
  id: "d01",
  name: "Browser Sandbox",
  number: 1,
  theme: "mainframe",
  reward: "firstWebpage",
  entrance: { x: 56 * TILE + 32, y: 4 * TILE + 32 },
}];

export const MERCHANTS = [
  { id: "village-shop", name: "Patch", x: 23, y: 15, stock: [["magicPatch", 15], ["potion", 35], ["heart", 80]] },
  { id: "grove-shop", name: "Root", x: 7, y: 15, stock: [["magicPatch", 15], ["potion", 35]] },
];

export const MAPS = {
  overworld: {
    id: "overworld",
    name: "Neon Stack City",
    width: SCREEN_COLS * 4,
    height: SCREEN_ROWS * 2,
    spawn: { x: 24 * TILE + 32, y: 15 * TILE + 32 },
    enemies: [
      ["ow-wood-slime", "slime", 7, 5], ["ow-wood-bat", "bat", 11, 15],
      ["ow-field-slime-a", "slime", 22, 5], ["ow-field-slime-b", "slime", 39, 15],
      ["ow-lake-bat", "bat", 40, 4], ["ow-high-guard", "guard", 55, 6],
      ["ow-grove-slime", "slime", 6, 15], ["ow-bluff-guard", "guard", 56, 15],
    ],
    chests: [
      ["ow-html-sword", 24, 4, "htmlSword"],
      ["ow-bombs", 58, 15, "bombs"],
      ["ow-bow", 44, 15, "bow"],
      ["ow-heart", 4, 4, "heart"],
    ],
  },
  d01: {
    id: "d01",
    name: "System I · Browser Sandbox",
    number: 1,
    theme: "mainframe",
    width: SCREEN_COLS * 3,
    height: SCREEN_ROWS * 3,
    spawn: { x: 24 * TILE + 32, y: 28 * TILE + 32 },
    exit: { x: 24 * TILE + 32, y: 29 * TILE + 32 },
    enemies: [
      ["d01-entry-a", "slime", 21, 25], ["d01-entry-b", "slime", 27, 25],
      ["d01-west-guard", "guard", 8, 15], ["d01-east-guard", "guard", 40, 15],
      ["d01-hall-bat-a", "bat", 21, 15], ["d01-hall-bat-b", "bat", 27, 15],
      ["d01-north-bat", "bat", 8, 5], ["d01-east-slime", "slime", 40, 5],
      ["d01-boss", "boss", 24, 4],
    ],
    chests: [
      ["d01-key", 7, 15, "key"],
      ["d01-map", 40, 15, "dungeonMap"],
      ["d01-reward", 24, 4, "firstWebpage"],
    ],
  },
  debugLab: {
    id: "debugLab",
    name: "Developer Debug Lab",
    theme: "mainframe",
    width: SCREEN_COLS,
    height: SCREEN_ROWS,
    spawn: { x: 8 * TILE + 32, y: 8 * TILE + 32 },
    exit: { x: 8 * TILE + 32, y: 9 * TILE + 32 },
    enemies: [
      ["debug-slime", "slime", 4, 6],
      ["debug-bat", "bat", 8, 6],
      ["debug-guard", "guard", 12, 6],
    ],
    chests: [
      ["debug-html", 2, 2, "htmlSword"],
      ["debug-css", 4, 2, "bow"],
      ["debug-js", 6, 2, "boomerang"],
      ["debug-bombs", 8, 2, "bombs"],
      ["debug-api", 10, 2, "hookshot"],
      ["debug-firewall", 12, 2, "fireRod"],
      ["debug-freeze", 14, 2, "iceRod"],
      ["debug-refactor", 3, 4, "hammer"],
      ["debug-vpn", 6, 4, "cape"],
      ["debug-root", 9, 4, "medallion"],
      ["debug-energy", 12, 4, "heart"],
      ["debug-lantern", 14, 4, "lantern"],
      ["debug-mirror", 2, 7, "mirror"],
      ["debug-jacket", 5, 7, "devJacket"],
      ["debug-shield", 8, 7, "shield"],
      ["debug-gloves", 11, 7, "glove"],
      ["debug-boots", 14, 7, "boots"],
    ],
  },
};

function opening(exits, lx, ly) {
  if (lx === 0 && exits.includes("w") && (ly === 4 || ly === 5)) return true;
  if (lx === SCREEN_COLS - 1 && exits.includes("e") && (ly === 4 || ly === 5)) return true;
  if (ly === 0 && exits.includes("n") && (lx === 7 || lx === 8)) return true;
  if (ly === SCREEN_ROWS - 1 && exits.includes("s") && (lx === 7 || lx === 8)) return true;
  return false;
}

function roomBoundary(exits, lx, ly) {
  const edge = lx === 0 || ly === 0 || lx === SCREEN_COLS - 1 || ly === SCREEN_ROWS - 1;
  return edge && !opening(exits, lx, ly);
}

function overworldTile(tx, ty, flags) {
  const rx = Math.floor(tx / SCREEN_COLS);
  const ry = Math.floor(ty / SCREEN_ROWS);
  const room = OW_ROOMS[`${rx},${ry}`];
  if (!room) return "void";
  const lx = tx % SCREEN_COLS;
  const ly = ty % SCREEN_ROWS;
  if (roomBoundary(room.exits, lx, ly)) return room.biome === "forest" ? "forestWall" : "mountain";

  // The beginner district is initially fenced in by corrupted data growth.
  // Once the HTML Sword is found, each patch can be cut to open the world.
  const starterBrush = (
    (tx === 16 && (ty === 4 || ty === 5 || ty === 14 || ty === 15))
    || (tx === 31 && (ty === 4 || ty === 5 || ty === 14 || ty === 15))
  );
  if (starterBrush && !flags[`brush_${tx}_${ty}`]) return "codeBrush";

  if (room.biome === "lake") {
    if (lx > 2 && lx < 13 && ly > 1 && ly < 8) {
      if (ly === 4 || ly === 5) return "bridge";
      return "water";
    }
    return "grass";
  }
  if (room.biome === "forest") {
    if ((lx + ly * 3) % 7 < 2 && lx > 2 && lx < 13 && ly > 1 && ly < 8) return "forest";
    return "grassAlt";
  }
  if (room.biome === "village") {
    if ((lx > 2 && lx < 6 && ly > 2 && ly < 6) || (lx > 10 && lx < 14 && ly > 2 && ly < 6)) return "house";
    return "village";
  }
  if (room.biome === "desert") return (lx + ly) % 4 ? "desert" : "desertAlt";
  if (room.biome === "stone") return (lx + ly) % 3 ? "stone" : "stoneAlt";
  return (lx * 7 + ly * 11) % 5 ? "grass" : "grassAlt";
}

function dungeonTile(tx, ty, flags) {
  const rx = Math.floor(tx / SCREEN_COLS);
  const ry = Math.floor(ty / SCREEN_ROWS);
  const room = DUNGEON_ROOMS[`${rx},${ry}`];
  if (!room) return "void";
  const lx = tx % SCREEN_COLS;
  const ly = ty % SCREEN_ROWS;

  if (roomBoundary(room.exits, lx, ly)) return "wall";

  // The door between the center room and boss room occupies matching tiles
  // on both sides of the screen boundary.
  const bossDoor = (rx === 1 && ry === 1 && ly === 0 && (lx === 7 || lx === 8))
    || (rx === 1 && ry === 0 && ly === 9 && (lx === 7 || lx === 8));
  if (bossDoor && !flags.door_d01) return "lockedDoor";

  if (rx === 0 && ry === 1 && lx === 1 && ly === 4) {
    return flags.secret_d01 ? "dungeonFloor" : "crackedWall";
  }
  if (rx === 1 && ry === 1 && ly === 6 && (lx === 5 || lx === 10) && !flags.switch_d01) return "barrier";
  if (rx === 1 && ry === 2 && lx === 8 && ly === 3) return "switch";

  if (room.variant === 1 && (lx === 4 || lx === 11) && ly > 2 && ly < 5) return "wall";
  if (room.variant === 2 && ly === 4 && ((lx > 2 && lx < 6) || (lx > 9 && lx < 13))) return "wall";
  if (room.variant === 3 && (lx === 5 || lx === 10) && ly > 5 && ly < 8) return "wall";
  return (lx + ly) % 2 ? "dungeonFloor" : "dungeonFloorAlt";
}

function debugLabTile(tx, ty) {
  if (tx === 0 || ty === 0 || tx === SCREEN_COLS - 1 || ty === SCREEN_ROWS - 1) {
    if (ty === SCREEN_ROWS - 1 && (tx === 7 || tx === 8)) return "dungeonFloor";
    return "wall";
  }
  if (ty === 5 && tx > 1 && tx < 14 && tx % 2 === 0) return "switch";
  return (tx + ty) % 2 ? "dungeonFloor" : "dungeonFloorAlt";
}

export function tileAt(mapId, tx, ty, flags = {}) {
  const map = MAPS[mapId];
  if (tx < 0 || ty < 0 || tx >= map.width || ty >= map.height) return "void";
  if (mapId === "overworld") return overworldTile(tx, ty, flags);
  if (mapId === "debugLab") return debugLabTile(tx, ty);
  return dungeonTile(tx, ty, flags);
}

export function roomNameAt(mapId, x, y) {
  if (mapId !== "overworld") return MAPS[mapId].name;
  const rx = Math.floor(x / (SCREEN_COLS * TILE));
  const ry = Math.floor(y / (SCREEN_ROWS * TILE));
  return OW_ROOMS[`${rx},${ry}`]?.name || MAPS.overworld.name;
}

export function isSolid(tile) {
  return ["void", "mountain", "forestWall", "forest", "water", "house", "wall", "lockedDoor", "crackedWall", "barrier", "codeBrush"].includes(tile);
}
