import { editableRoomAt } from "./rooms/roomRegistry";
import { indexedRoomTileAt } from "./art/tileIndex";

export const TILE = 64;
export const SCREEN_COLS = 16;
export const SCREEN_ROWS = 10;
export const WORLD_COLS = 16;
export const WORLD_ROWS = 16;

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

function regionNameFor(roomX, roomY) {
  if (roomX <= 3 && roomY <= 3) return "Greenwood Vale";
  if (roomX >= 12) return "Stormbreak Coast";
  if (roomY >= 12 && roomX < 7) return "Sunscar Desert";
  if (roomY >= 12) return "Crystal Highlands";
  if (roomX >= 9 && roomY >= 7) return "Amber Wastes";
  if (roomY <= 2 && roomX >= 7) return "Crown Mountains";
  if ((roomX === 6 && roomY >= 3) || (roomY === 6 && roomX >= 4)) return "Silverwater Reach";
  return "Everdawn Fields";
}

function exitsFor(roomX, roomY) {
  const exits = [];
  if (roomY > 0 && (roomX % 3 === 1 || roomY % 4 === 0)) exits.push("n");
  if (roomY < WORLD_ROWS - 1 && (roomX % 3 === 1 || (roomY + 1) % 4 === 0)) exits.push("s");
  if (roomX > 0 && (roomY % 3 === 1 || roomX % 4 === 0)) exits.push("w");
  if (roomX < WORLD_COLS - 1 && (roomY % 3 === 1 || (roomX + 1) % 4 === 0)) exits.push("e");
  return exits;
}

function buildOverworldRooms() {
  const rooms = {};
  for (let ry = 0; ry < WORLD_ROWS; ry += 1) {
    for (let rx = 0; rx < WORLD_COLS; rx += 1) {
      rooms[`${rx},${ry}`] = {
        name: regionNameFor(rx, ry),
        biome: biomeFor(rx, ry),
        exits: exitsFor(rx, ry),
      };
    }
  }
  Object.assign(rooms, {
    "0,0": { ...rooms["0,0"], name: "Oldgrowth Grove" },
    "1,0": { ...rooms["1,0"], name: "Hero's Grove", exits: ["e", "s"] },
    "2,0": { ...rooms["2,0"], name: "Whispering Wood", exits: ["w", "s"] },
    "0,1": { ...rooms["0,1"], name: "Mosslight Clearing", exits: ["e"] },
    "1,1": { ...rooms["1,1"], name: "Willowbrook Village", biome: "village", exits: ["n", "s", "w", "e"] },
    "2,1": { ...rooms["2,1"], name: "Eastwind Meadow", exits: ["w", "s"] },
    "1,2": { ...rooms["1,2"], name: "Applewood Orchard", exits: ["n", "e"] },
    "2,2": { ...rooms["2,2"], name: "Millpond Crossing", biome: "lake", exits: ["n", "w", "e"] },
    // The main quest road is authored as a reciprocal room graph. Optional
    // wilderness branches still use the generated exits above.
    "3,2": { ...rooms["3,2"], name: "Temple Trail", exits: ["n", "w", "e"] },
    "3,1": { ...rooms["3,1"], name: "Oldgrowth Ascent", exits: ["n", "s"] },
    "3,0": { ...rooms["3,0"], name: "Rootbound Approach", exits: ["s"] },
    "4,2": { ...rooms["4,2"], name: "Briar Road", exits: ["w", "e"] },
    "5,2": { ...rooms["5,2"], name: "Rosewall Road", exits: ["w", "s"] },
    "4,3": { ...rooms["4,3"], name: "Briar Gate" },
    "5,3": { ...rooms["5,3"], name: "Rosewall Hamlet", biome: "village", exits: ["n", "e"] },
    "6,3": { ...rooms["6,3"], name: "Silverwater Gate", exits: ["w", "s"] },
    "6,4": { ...rooms["6,4"], name: "Silverwater Bank", biome: "lake", exits: ["n", "s"] },
    "6,5": { ...rooms["6,5"], name: "Pilgrim's Ford", biome: "lake", exits: ["n", "s"] },
    "6,6": { ...rooms["6,6"], name: "Moonstone Road", exits: ["n", "e"] },
    "7,6": { ...rooms["7,6"], name: "Moonstone Keep", biome: "stone", exits: ["w", "e"] },
    "8,6": { ...rooms["8,6"], name: "Crystalwater Approach", biome: "stone", exits: ["w"] },
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
    id: "d01", name: "Rootbound Temple", number: 1, theme: "forest",
    reward: "firstWebpage", entrance: { x: 56 * TILE + 32, y: 4 * TILE + 32 },
  },
  {
    id: "d02", name: "Emberstone Ruins", number: 2, theme: "fire",
    reward: "reactApp", entrance: { x: 88 * TILE + 32, y: 34 * TILE + 32 },
  },
  {
    id: "d03", name: "Crystalwater Vault", number: 3, theme: "water",
    reward: "backendApi", entrance: { x: 136 * TILE + 32, y: 64 * TILE + 32 },
  },
];

export const MERCHANTS = [
  { id: "village-shop", name: "Rowan", x: 22, y: 15, stock: [["magicPatch", 15], ["potion", 35], ["heart", 80]] },
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
      const biomeTypes = {
        forest: ["forestByteBeetle", "caveEchoBat"],
        grass: ["forestByteBeetle", "waterCurrentBlob"],
        village: ["forestByteBeetle"],
        lake: ["waterCurrentBlob", "caveEchoBat"],
        desert: ["desertSandSkitter", "caveEchoBat"],
        stone: ["caveEchoBat", "desertSandSkitter"],
      };
      const types = biomeTypes[biomeFor(rx, ry)] || biomeTypes.grass;
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
  const bossTypes = {
    d01: "bossCacheColossus",
    d02: "bossFluxSovereign",
    d03: "bossRootWarden",
  };
  const commonTypes = {
    d01: ["forestByteBeetle", "caveEchoBat"],
    d02: ["desertSandSkitter", "dungeonFirewallDrone"],
    d03: ["waterCurrentBlob", "caveEchoBat"],
  }[id];
  return [
    [`${id}-entry-a`, commonTypes[0], 21, 23], [`${id}-entry-b`, commonTypes[0], 27, 23],
    [`${id}-west-guard`, commonTypes[1], 8, 15], [`${id}-east-guard`, commonTypes[1], 40, 15],
    [`${id}-hall-bat-a`, commonTypes[1], 21, 15], [`${id}-hall-bat-b`, commonTypes[1], 27, 15],
    [`${id}-north-bat`, commonTypes[1], 8, 5], [`${id}-east-slime`, commonTypes[0], 40, 5],
    [`${id}-boss`, bossTypes[id], 24, 4],
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
    name: "The Realm of Everdawn",
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
    id: "d01", name: "Temple I · Rootbound Temple", number: 1, theme: "forest",
    width: SCREEN_COLS * 3, height: SCREEN_ROWS * 3,
    spawn: { x: 24 * TILE + 32, y: 28 * TILE + 32 },
    exit: { x: 24 * TILE + 32, y: 29 * TILE + 32 },
    enemies: dungeonEnemies("d01"),
    chests: dungeonChests("d01", "firstWebpage"),
  },
  d02: {
    id: "d02", name: "Temple II · Emberstone Ruins", number: 2, theme: "fire",
    width: SCREEN_COLS * 3, height: SCREEN_ROWS * 3,
    spawn: { x: 24 * TILE + 32, y: 28 * TILE + 32 },
    exit: { x: 24 * TILE + 32, y: 29 * TILE + 32 },
    enemies: dungeonEnemies("d02"),
    chests: dungeonChests("d02", "reactApp"),
  },
  d03: {
    id: "d03", name: "Temple III · Crystalwater Vault", number: 3, theme: "water",
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
    if (lx === 7 || lx === 8 || ly === 4 || ly === 5) return "village";
    return (lx + ly) % 5 ? "grass" : "grassAlt";
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
  const rx = Math.floor(x / (SCREEN_COLS * TILE));
  const ry = Math.floor(y / (SCREEN_ROWS * TILE));
  if (mapId !== "overworld") {
    const roomName = editableRoomAt(mapId, rx, ry)?.name;
    return roomName ? `${MAPS[mapId].name} · ${roomName}` : MAPS[mapId].name;
  }
  const roomName = OW_ROOMS[`${rx},${ry}`]?.name || MAPS.overworld.name;
  const coordinate = `${rx + 1}${String.fromCharCode(65 + ry)}`;
  return `${roomName} · ${coordinate}`;
}

export function roomExitsAt(mapId, roomX, roomY) {
  if (mapId === "overworld") return OW_ROOMS[`${roomX},${roomY}`]?.exits || [];
  if (mapId === "debugLab") return [];
  const base = DUNGEON_ROOMS[`${roomX},${roomY}`];
  const editable = editableRoomAt(mapId, roomX, roomY);
  return (editable?.exits || base?.exits || []);
}

export function isSolid(tile) {
  return [
    "void", "mountain", "forestWall", "forest", "water", "house", "wall",
    "lockedDoor", "crackedWall", "barrier", "codeBrush", "callbackNode",
    "callbackNode2",
  ].includes(tile);
}
