import { editableRoomAt } from "./rooms/roomRegistry";
import { indexedRoomTileAt } from "./art/tileIndex";

export const TILE = 64;
export const SCREEN_COLS = 16;
export const SCREEN_ROWS = 10;
export const WORLD_COLS = 16;
export const WORLD_ROWS = 16;

const REGION_NAMES = [
  "Legacy Frontier", "Open Source Ward", "Data Coast", "Cloud Reach",
  "Callback Expanse", "Component Borough", "Runtime Badlands",
  "Backend Depths", "Deployment Edge",
  "Package Highlands", "Container Port", "Query Gardens", "Kernel Range",
  "Pipeline Basin", "Release Coast", "Production Crown",
];

const BIOME_ROWS = [
  ["forest", "grass", "lake", "stone", "stone", "village", "desert", "stone", "desert"],
  ["forest", "village", "grass", "desert", "grass", "village", "desert", "forest", "stone"],
  ["grass", "forest", "lake", "grass", "desert", "stone", "forest", "grass", "desert"],
  ["desert", "grass", "stone", "forest", "village", "lake", "stone", "desert", "forest"],
  ["forest", "lake", "grass", "desert", "stone", "village", "forest", "lake", "stone"],
  ["stone", "desert", "forest", "grass", "lake", "stone", "village", "forest", "desert"],
  ["lake", "grass", "village", "forest", "desert", "grass", "stone", "village", "forest"],
  ["desert", "stone", "grass", "lake", "forest", "desert", "grass", "stone", "village"],
];

function buildOverworldRooms() {
  const rooms = {};
  for (let ry = 0; ry < WORLD_ROWS; ry += 1) {
    for (let rx = 0; rx < WORLD_COLS; rx += 1) {
      const exits = [];
      if (ry > 0) exits.push("n");
      if (ry < WORLD_ROWS - 1) exits.push("s");
      if (rx > 0) exits.push("w");
      if (rx < WORLD_COLS - 1) exits.push("e");
      rooms[`${rx},${ry}`] = {
        name: `${REGION_NAMES[rx]} · NODE ${ry + 1}`,
        biome: BIOME_ROWS[ry]?.[rx]
          || ["grass", "forest", "stone", "village", "desert", "lake"][(rx * 5 + ry * 3) % 6],
        exits,
      };
    }
  }
  Object.assign(rooms, {
    "0,0": { ...rooms["0,0"], name: "Legacy Code Wilds" },
    "1,0": { ...rooms["1,0"], name: "Markup Foundry" },
    "2,0": { ...rooms["2,0"], name: "Data Stream Reservoir" },
    "3,0": { ...rooms["3,0"], name: "Cloud Platform" },
    "0,1": { ...rooms["0,1"], name: "Deprecated District" },
    "1,1": { ...rooms["1,1"], name: "New Dev Quarter" },
    "2,1": { ...rooms["2,1"], name: "Framework Freeway" },
    "3,1": { ...rooms["3,1"], name: "Silicon Wastes" },
    "4,3": { ...rooms["4,3"], name: "Callback Firewall" },
    "5,3": { ...rooms["5,3"], name: "Component Campus" },
    "7,6": { ...rooms["7,6"], name: "Serverless Citadel" },
    "8,6": { ...rooms["8,6"], name: "Deployment Terminal" },
  });
  return rooms;
}

const OW_ROOMS = buildOverworldRooms();

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

export const DUNGEONS = [
  {
    id: "d01", name: "Browser Sandbox", number: 1, theme: "mainframe",
    reward: "firstWebpage", entrance: { x: 56 * TILE + 32, y: 4 * TILE + 32 },
  },
  {
    id: "d02", name: "Component Factory", number: 2, theme: "reactor",
    reward: "reactApp", entrance: { x: 88 * TILE + 32, y: 34 * TILE + 32 },
  },
  {
    id: "d03", name: "Backend Core", number: 3, theme: "server",
    reward: "backendApi", entrance: { x: 136 * TILE + 32, y: 64 * TILE + 32 },
  },
];

export const MERCHANTS = [
  { id: "village-shop", name: "Patch", x: 23, y: 15, stock: [["magicPatch", 15], ["potion", 35], ["heart", 80]] },
  { id: "grove-shop", name: "Root", x: 8, y: 15, stock: [["magicPatch", 15], ["potion", 35]] },
  { id: "component-shop", name: "Props", x: 82, y: 35, stock: [["magicPatch", 20], ["potion", 35], ["heart", 100]] },
  { id: "backend-shop", name: "Daemon", x: 119, y: 65, stock: [["magicPatch", 20], ["potion", 35], ["heart", 120]] },
  { id: "deploy-shop", name: "Ship", x: 136, y: 75, stock: [["magicPatch", 20], ["potion", 35]] },
];

function buildOverworldEnemies() {
  const enemies = [];
  for (let ry = 0; ry < WORLD_ROWS; ry += 1) {
    for (let rx = 0; rx < WORLD_COLS; rx += 1) {
      if ((rx === 1 && ry === 1) || (rx === 1 && ry === 0)) continue;
      const types = ["slime", "bat", "guard"];
      const type = types[(rx * 2 + ry) % types.length];
      enemies.push([
        `ow-${rx}-${ry}-a`, type,
        rx * SCREEN_COLS + 5 + (ry % 5),
        ry * SCREEN_ROWS + 4 + (rx % 3),
      ]);
      if ((rx + ry) % 3 === 0) {
        enemies.push([
          `ow-${rx}-${ry}-b`, types[(rx + ry + 1) % types.length],
          rx * SCREEN_COLS + 11,
          ry * SCREEN_ROWS + 6,
        ]);
      }
    }
  }
  return enemies;
}

function dungeonEnemies(id) {
  return [
    [`${id}-entry-a`, "slime", 21, 25], [`${id}-entry-b`, "slime", 27, 25],
    [`${id}-west-guard`, "guard", 8, 15], [`${id}-east-guard`, "guard", 40, 15],
    [`${id}-hall-bat-a`, "bat", 21, 15], [`${id}-hall-bat-b`, "bat", 27, 15],
    [`${id}-north-bat`, "bat", 8, 5], [`${id}-east-slime`, "slime", 40, 5],
    [`${id}-boss`, id === "d02" ? "mage" : "boss", 24, 4],
  ];
}

function dungeonChests(id, reward) {
  return [
    [`${id}-key`, 7, 15, "key"],
    [`${id}-map`, 40, 15, "dungeonMap"],
    [`${id}-reward`, 24, 4, reward],
  ];
}

export const MAPS = {
  overworld: {
    id: "overworld",
    name: "Neon Stack City",
    width: SCREEN_COLS * WORLD_COLS,
    height: SCREEN_ROWS * WORLD_ROWS,
    spawn: { x: 24 * TILE + 32, y: 15 * TILE + 32 },
    enemies: buildOverworldEnemies(),
    chests: [
      ["ow-html-sword", 24, 4, "htmlSword"],
      ["ow-css", 44, 15, "bow"],
      ["ow-bombs", 58, 15, "bombs"],
      ["ow-heart-01", 4, 4, "heart"],
      ["ow-heart-02", 73, 24, "heart"],
      ["ow-firewall", 100, 44, "fireRod"],
      ["ow-jacket", 120, 54, "devJacket"],
      ["ow-gloves", 136, 74, "glove"],
    ],
  },
  d01: {
    id: "d01", name: "System I · Browser Sandbox", number: 1, theme: "mainframe",
    width: SCREEN_COLS * 3, height: SCREEN_ROWS * 3,
    spawn: { x: 24 * TILE + 32, y: 28 * TILE + 32 },
    exit: { x: 24 * TILE + 32, y: 29 * TILE + 32 },
    enemies: dungeonEnemies("d01"),
    chests: dungeonChests("d01", "firstWebpage"),
  },
  d02: {
    id: "d02", name: "System II · Component Factory", number: 2, theme: "reactor",
    width: SCREEN_COLS * 3, height: SCREEN_ROWS * 3,
    spawn: { x: 24 * TILE + 32, y: 28 * TILE + 32 },
    exit: { x: 24 * TILE + 32, y: 29 * TILE + 32 },
    enemies: dungeonEnemies("d02"),
    chests: dungeonChests("d02", "reactApp"),
  },
  d03: {
    id: "d03", name: "System III · Backend Core", number: 3, theme: "server",
    width: SCREEN_COLS * 3, height: SCREEN_ROWS * 3,
    spawn: { x: 24 * TILE + 32, y: 28 * TILE + 32 },
    exit: { x: 24 * TILE + 32, y: 29 * TILE + 32 },
    enemies: dungeonEnemies("d03"),
    chests: dungeonChests("d03", "backendApi"),
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
      ["debug-html", 2, 2, "htmlSword"], ["debug-css", 4, 2, "bow"],
      ["debug-js", 6, 2, "boomerang"], ["debug-bombs", 8, 2, "bombs"],
      ["debug-api", 10, 2, "hookshot"], ["debug-firewall", 12, 2, "fireRod"],
      ["debug-freeze", 14, 2, "iceRod"], ["debug-refactor", 3, 4, "hammer"],
      ["debug-vpn", 6, 4, "cape"], ["debug-root", 9, 4, "medallion"],
      ["debug-energy", 12, 4, "heart"], ["debug-lantern", 14, 4, "lantern"],
      ["debug-mirror", 2, 7, "mirror"], ["debug-jacket", 5, 7, "devJacket"],
      ["debug-shield", 8, 7, "shield"], ["debug-gloves", 11, 7, "glove"],
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

  const starterBrush = (
    (tx === 16 && (ty === 4 || ty === 5 || ty === 14 || ty === 15))
    || (tx === 31 && (ty === 4 || ty === 5 || ty === 14 || ty === 15))
    || ((tx === 23 || tx === 24) && ty === 19)
  );
  if (starterBrush && !flags[`brush_${tx}_${ty}`]) return "codeBrush";

  if (tx === 63 && (ly === 4 || ly === 5) && !flags.callback_firewall_1) return "callbackNode";
  if (tx === 111 && (ly === 4 || ly === 5) && !flags.callback_firewall_2) return "callbackNode2";

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

function dungeonTile(mapId, tx, ty, flags) {
  const rx = Math.floor(tx / SCREEN_COLS);
  const ry = Math.floor(ty / SCREEN_ROWS);
  const baseRoom = DUNGEON_ROOMS[`${rx},${ry}`];
  const editableRoom = editableRoomAt(mapId, rx, ry);
  const room = baseRoom && editableRoom ? { ...baseRoom, ...editableRoom } : baseRoom;
  if (!room) return "void";
  const lx = tx % SCREEN_COLS;
  const ly = ty % SCREEN_ROWS;

  if (roomBoundary(room.exits, lx, ly)) return "wall";
  if (room.wallRects?.some(([x, y, width, height]) => (
    lx >= x && lx < x + width && ly >= y && ly < y + height
  ))) return "wall";

  const bossDoor = (rx === 1 && ry === 1 && ly === 0 && (lx === 7 || lx === 8))
    || (rx === 1 && ry === 0 && ly === 9 && (lx === 7 || lx === 8));
  if (bossDoor && !flags[`door_${mapId}`]) return "lockedDoor";

  if (rx === 0 && ry === 1 && lx === 1 && ly === 4) {
    return flags[`secret_${mapId}`] ? "dungeonFloor" : "crackedWall";
  }
  if (rx === 1 && ry === 1 && ly === 6 && (lx === 5 || lx === 10) && !flags[`switch_${mapId}`]) return "barrier";
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
  const indexedTile = indexedRoomTileAt(mapId, tx, ty);
  if (indexedTile) return indexedTile.tile;
  if (mapId === "overworld") return overworldTile(tx, ty, flags);
  if (mapId === "debugLab") return debugLabTile(tx, ty);
  return dungeonTile(mapId, tx, ty, flags);
}

export function roomNameAt(mapId, x, y) {
  if (mapId !== "overworld") return MAPS[mapId].name;
  const rx = Math.floor(x / (SCREEN_COLS * TILE));
  const ry = Math.floor(y / (SCREEN_ROWS * TILE));
  const roomName = OW_ROOMS[`${rx},${ry}`]?.name || MAPS.overworld.name;
  const coordinate = `${rx + 1}${String.fromCharCode(65 + ry)}`;
  return `${roomName} · ${coordinate}`;
}

export function isSolid(tile) {
  return [
    "void", "mountain", "forestWall", "forest", "water", "house", "wall",
    "lockedDoor", "crackedWall", "barrier", "codeBrush", "callbackNode",
    "callbackNode2",
  ].includes(tile);
}
