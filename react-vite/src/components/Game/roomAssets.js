import { roomAssetsAt } from "./rooms/roomRegistry";
import { drawCatalogArt } from "./art/artLoader";

const TILE = 64;
const SCREEN_COLS = 16;
const SCREEN_ROWS = 10;

export const ROOM_ASSET_TYPES = [
  "serverRack", "terminal", "neonSign", "codeCrate", "dataPlant",
  "streetLamp", "bench", "holoTable", "pipeCluster", "debugStatue",
  "cyberTree", "boulder", "fountain", "marketStall", "satelliteDish",
  "solarPanel", "windTurbine", "dumpster", "flowerPatch", "obelisk",
  "villageSign", "villageLamp", "villageWell",
  "desertCactus", "desertDryBush", "desertBones", "desertRock",
  "desertRuins", "desertOasis",
  "coastFoam", "coastReeds",
  "coastDock", "coastBoat", "coastWaterfall", "coastLilyPad", "coastCoral",
  "caveStalagmite", "caveBones", "caveTorch",
  "crystalSmall", "crystalLarge",
  "dungeonDoor", "dungeonLockedDoor", "dungeonBarrier", "dungeonSwitch",
  "dungeonStatue", "dungeonPillar",
  "dungeonChest", "dungeonPot", "dungeonCrate", "dungeonTerminal",
  "dungeonSpikeTrap", "dungeonStairs", "dungeonPortal",
  "villagerGardener", "villagerMechanic", "merchantTraveler",
  "merchantTechnician", "questArchivist", "questNetworkScout",
];

const ASSET_RULES = {
  serverRack: { solid: true },
  terminal: { solid: true },
  neonSign: { solid: false },
  codeCrate: { solid: true },
  dataPlant: { solid: true },
  streetLamp: { solid: true },
  bench: { solid: true },
  holoTable: { solid: true },
  pipeCluster: { solid: true },
  debugStatue: { solid: true },
  forestTree: { solid: true },
  forestBush: { solid: true },
  forestFlowers: { solid: false },
  forestMushrooms: { solid: false },
  forestStump: { solid: true },
  forestLog: { solid: true },
  forestTallGrass: { solid: false },
  bridgeVertical: { solid: false },
  villageHouse: { solid: true },
  villageShop: { solid: true },
  villageFence: { solid: true },
  villageSign: { solid: true },
  villageLamp: { solid: true },
  villageWell: { solid: true },
  desertCactus: { solid: true },
  desertDryBush: { solid: true },
  desertBones: { solid: false },
  desertRock: { solid: true },
  desertRuins: { solid: true },
  desertOasis: { solid: true },
  coastFoam: { solid: false },
  coastReeds: { solid: false },
  coastDock: { solid: false },
  coastBoat: { solid: true },
  coastWaterfall: { solid: true },
  coastLilyPad: { solid: false },
  coastCoral: { solid: true },
  caveStalagmite: { solid: true },
  caveBones: { solid: false },
  caveTorch: { solid: false },
  crystalSmall: { solid: true },
  crystalLarge: { solid: true },
  dungeonDoor: { solid: true },
  dungeonLockedDoor: { solid: true },
  dungeonBarrier: { solid: true },
  dungeonSwitch: { solid: false },
  dungeonStatue: { solid: true },
  dungeonPillar: { solid: true },
  dungeonChest: { solid: true },
  dungeonPot: { solid: true },
  dungeonCrate: { solid: true },
  dungeonTerminal: { solid: true },
  dungeonSpikeTrap: { solid: false },
  dungeonStairs: { solid: false },
  dungeonPortal: { solid: false },
  villagerGardener: { solid: true },
  villagerMechanic: { solid: true },
  merchantTraveler: { solid: true },
  merchantTechnician: { solid: true },
  questArchivist: { solid: true },
  questNetworkScout: { solid: true },
  cyberTree: { solid: true },
  boulder: { solid: true },
  fountain: { solid: true },
  marketStall: { solid: true },
  satelliteDish: { solid: true },
  solarPanel: { solid: true },
  windTurbine: { solid: true },
  dumpster: { solid: true },
  flowerPatch: { solid: false },
  obelisk: { solid: true },
};

export function roomAssetAt(mapId, tx, ty) {
  const roomX = Math.floor(tx / SCREEN_COLS);
  const roomY = Math.floor(ty / SCREEN_ROWS);
  const localX = tx - roomX * SCREEN_COLS;
  const localY = ty - roomY * SCREEN_ROWS;
  return roomAssetsAt(mapId, roomX, roomY).find((asset) => {
    const collision = asset.collision;
    if (!collision) return asset.x === localX && asset.y === localY;
    return localX >= asset.x - (collision.left || 0)
      && localX <= asset.x + (collision.right || 0)
      && localY >= asset.y - (collision.top || 0)
      && localY <= asset.y + (collision.bottom || 0);
  });
}

export function roomAssetIsSolid(asset) {
  return Boolean(asset?.solid ?? ASSET_RULES[asset?.type]?.solid);
}

// Physical footprints are intentionally much smaller than the artwork.  The
// asset's x/y point is its 64px placement anchor; tall scenery may extend far
// above that point without turning its whole image into an invisible wall.
const COLLISION_PROFILES = {
  forestTree: { x: 17, y: 39, width: 30, height: 21, sortY: 60 },
  cyberTree: { x: 17, y: 39, width: 30, height: 21, sortY: 60 },
  forestBush: { x: 9, y: 35, width: 46, height: 24, sortY: 59 },
  forestStump: { x: 13, y: 35, width: 38, height: 25, sortY: 60 },
  forestLog: { x: 5, y: 38, width: 54, height: 20, sortY: 58 },
  villageHouse: { x: -70, y: 30, width: 204, height: 30, sortY: 60 },
  villageShop: { x: -70, y: 30, width: 204, height: 30, sortY: 60 },
  villageWell: { x: 4, y: 30, width: 56, height: 29, sortY: 59 },
  villageFence: { x: 2, y: 38, width: 60, height: 20, sortY: 58 },
  villageSign: { x: 20, y: 36, width: 24, height: 23, sortY: 59 },
  villageLamp: { x: 23, y: 39, width: 18, height: 21, sortY: 60 },
  boulder: { x: 9, y: 31, width: 46, height: 28, sortY: 59 },
  desertRock: { x: 9, y: 31, width: 46, height: 28, sortY: 59 },
  desertCactus: { x: 19, y: 37, width: 26, height: 23, sortY: 60 },
  caveStalagmite: { x: 17, y: 39, width: 30, height: 21, sortY: 60 },
  crystalSmall: { x: 18, y: 39, width: 28, height: 21, sortY: 60 },
  crystalLarge: { x: 13, y: 35, width: 38, height: 25, sortY: 60 },
  dungeonPillar: { x: 13, y: 35, width: 38, height: 25, sortY: 60 },
  dungeonStatue: { x: 11, y: 34, width: 42, height: 26, sortY: 60 },
};

const DEFAULT_FOOTPRINT = { x: 9, y: 35, width: 46, height: 24, sortY: 59 };

export function roomAssetFootprint(asset) {
  if (!roomAssetIsSolid(asset)) return null;
  const profile = COLLISION_PROFILES[asset.type] || DEFAULT_FOOTPRINT;
  return {
    left: asset.worldX + profile.x,
    top: asset.worldY + profile.y,
    right: asset.worldX + profile.x + profile.width,
    bottom: asset.worldY + profile.y + profile.height,
  };
}

export function roomAssetSolidAt(mapId, worldX, worldY) {
  return visibleRoomAssets(mapId, worldX - 256, worldY - 256, 512, 512)
    .some((asset) => {
      const box = roomAssetFootprint(asset);
      return box && worldX >= box.left && worldX <= box.right
        && worldY >= box.top && worldY <= box.bottom;
    });
}

export function roomAssetSortY(asset) {
  return asset.worldY + (COLLISION_PROFILES[asset.type]?.sortY ?? 59);
}

function pixel(ctx, x, y, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), width, height);
}

function label(ctx, value, x, y, size, color) {
  ctx.font = `700 ${size}px monospace`;
  ctx.textAlign = "center";
  ctx.fillStyle = "#000a";
  ctx.fillText(value, x + 1, y + 1);
  ctx.fillStyle = color;
  ctx.fillText(value, x, y);
}

const DRAW = {
  serverRack(ctx, x, y, asset) {
    pixel(ctx, x + 8, y + 5, 48, 55, asset.color || "#242b42");
    pixel(ctx, x + 12, y + 9, 40, 47, "#101522");
    for (let row = 0; row < 4; row += 1) {
      pixel(ctx, x + 16, y + 14 + row * 10, 28, 5, "#34425a");
      pixel(ctx, x + 46, y + 15 + row * 10, 3, 3, row % 2 ? "#f02ea5" : "#42efd4");
    }
  },
  terminal(ctx, x, y, asset) {
    pixel(ctx, x + 8, y + 13, 48, 35, asset.color || "#303650");
    pixel(ctx, x + 13, y + 18, 38, 22, "#07131c");
    pixel(ctx, x + 17, y + 22, 22, 3, "#42efd4");
    pixel(ctx, x + 17, y + 29, 29, 3, "#f02ea5");
    pixel(ctx, x + 25, y + 48, 14, 10, "#202638");
  },
  neonSign(ctx, x, y, asset) {
    pixel(ctx, x + 5, y + 14, 54, 29, "#101522cc");
    pixel(ctx, x + 8, y + 17, 48, 23, asset.color || "#4b1d52");
    label(ctx, asset.text || "DEV", x + 32, y + 34, 10, "#bafff5");
  },
  codeCrate(ctx, x, y, asset) {
    pixel(ctx, x + 8, y + 12, 48, 45, asset.color || "#6b4551");
    pixel(ctx, x + 12, y + 16, 40, 37, "#342b3e");
    pixel(ctx, x + 8, y + 28, 48, 6, "#b26b64");
    label(ctx, "</>", x + 32, y + 47, 9, "#42efd4");
  },
  dataPlant(ctx, x, y, asset) {
    pixel(ctx, x + 22, y + 42, 20, 17, asset.color || "#79515e");
    pixel(ctx, x + 30, y + 18, 4, 28, "#278f78");
    pixel(ctx, x + 13, y + 18, 19, 10, "#42c49e");
    pixel(ctx, x + 32, y + 25, 18, 10, "#2da987");
    pixel(ctx, x + 21, y + 9, 17, 10, "#5ce6b9");
  },
  streetLamp(ctx, x, y, asset) {
    pixel(ctx, x + 29, y + 22, 6, 38, "#394054");
    pixel(ctx, x + 20, y + 10, 24, 16, asset.color || "#42efd4");
    pixel(ctx, x + 24, y + 14, 16, 8, "#fff3a1");
    pixel(ctx, x + 23, y + 59, 18, 4, "#202638");
  },
  bench(ctx, x, y, asset) {
    pixel(ctx, x + 7, y + 25, 50, 10, asset.color || "#8b5d52");
    pixel(ctx, x + 7, y + 40, 50, 8, "#65434a");
    pixel(ctx, x + 12, y + 48, 6, 11, "#292e3d");
    pixel(ctx, x + 46, y + 48, 6, 11, "#292e3d");
  },
  holoTable(ctx, x, y, asset) {
    pixel(ctx, x + 8, y + 37, 48, 13, asset.color || "#414963");
    pixel(ctx, x + 15, y + 50, 7, 11, "#242b3b");
    pixel(ctx, x + 42, y + 50, 7, 11, "#242b3b");
    ctx.strokeStyle = "#42efd4aa";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(x + 32, y + 25, 20, 10, 0, 0, Math.PI * 2);
    ctx.stroke();
  },
  pipeCluster(ctx, x, y, asset) {
    const color = asset.color || "#596477";
    pixel(ctx, x + 10, y + 5, 9, 55, color);
    pixel(ctx, x + 27, y + 14, 9, 46, color);
    pixel(ctx, x + 44, y + 8, 9, 52, color);
    pixel(ctx, x + 7, y + 17, 49, 7, "#353d4c");
  },
  debugStatue(ctx, x, y, asset) {
    pixel(ctx, x + 14, y + 50, 36, 11, asset.color || "#3d5264");
    pixel(ctx, x + 20, y + 20, 24, 31, "#536f7e");
    pixel(ctx, x + 24, y + 8, 16, 15, "#6e8c96");
    label(ctx, "?", x + 32, y + 42, 16, "#f02ea5");
  },
  cyberTree(ctx, x, y, asset) {
    pixel(ctx, x + 27, y + 35, 10, 27, "#63404d");
    pixel(ctx, x + 9, y + 13, 46, 29, asset.color || "#176957");
    pixel(ctx, x + 15, y + 7, 25, 25, "#238b70");
    pixel(ctx, x + 35, y + 18, 19, 18, "#31aa83");
    pixel(ctx, x + 20, y + 16, 5, 5, "#42efd4");
    pixel(ctx, x + 42, y + 25, 4, 4, "#f02ea5");
  },
  boulder(ctx, x, y, asset) {
    pixel(ctx, x + 9, y + 27, 46, 30, asset.color || "#51596b");
    pixel(ctx, x + 16, y + 18, 31, 38, "#687184");
    pixel(ctx, x + 22, y + 21, 21, 7, "#8a91a0");
    pixel(ctx, x + 13, y + 45, 38, 9, "#404758");
  },
  fountain(ctx, x, y, asset) {
    pixel(ctx, x + 7, y + 41, 50, 18, asset.color || "#46586d");
    pixel(ctx, x + 12, y + 34, 40, 17, "#203f57");
    pixel(ctx, x + 29, y + 15, 6, 25, "#66788b");
    pixel(ctx, x + 23, y + 23, 18, 5, "#42efd4");
    pixel(ctx, x + 17, y + 31, 30, 4, "#57bddd");
  },
  marketStall(ctx, x, y, asset) {
    pixel(ctx, x + 8, y + 27, 48, 30, "#63404c");
    pixel(ctx, x + 5, y + 15, 54, 16, asset.color || "#d04b86");
    for (let stripe = 0; stripe < 5; stripe += 1) {
      pixel(ctx, x + 7 + stripe * 11, y + 15, 6, 16, stripe % 2 ? "#42efd4" : "#f4d06f");
    }
    pixel(ctx, x + 14, y + 39, 36, 6, "#d28b51");
  },
  satelliteDish(ctx, x, y, asset) {
    pixel(ctx, x + 28, y + 34, 8, 25, "#40495c");
    pixel(ctx, x + 17, y + 56, 30, 5, "#242b3b");
    ctx.fillStyle = asset.color || "#77869a";
    ctx.beginPath();
    ctx.arc(x + 31, y + 28, 20, 0.1, Math.PI + 0.1);
    ctx.fill();
    pixel(ctx, x + 30, y + 23, 5, 5, "#f02ea5");
  },
  solarPanel(ctx, x, y, asset) {
    pixel(ctx, x + 7, y + 16, 50, 31, asset.color || "#174f70");
    for (let column = 1; column < 4; column += 1) pixel(ctx, x + 7 + column * 12, y + 16, 2, 31, "#42a5bb");
    pixel(ctx, x + 7, y + 30, 50, 2, "#42a5bb");
    pixel(ctx, x + 28, y + 47, 8, 12, "#384054");
  },
  windTurbine(ctx, x, y, asset) {
    pixel(ctx, x + 30, y + 24, 5, 38, "#647386");
    pixel(ctx, x + 27, y + 18, 11, 11, asset.color || "#42efd4");
    pixel(ctx, x + 31, y + 2, 3, 19, "#a9c8cf");
    pixel(ctx, x + 35, y + 21, 20, 3, "#a9c8cf");
    pixel(ctx, x + 11, y + 21, 19, 3, "#a9c8cf");
  },
  dumpster(ctx, x, y, asset) {
    pixel(ctx, x + 7, y + 24, 50, 33, asset.color || "#315f59");
    pixel(ctx, x + 4, y + 19, 56, 9, "#43766c");
    pixel(ctx, x + 13, y + 31, 38, 4, "#203f40");
    pixel(ctx, x + 12, y + 57, 8, 5, "#171d29");
    pixel(ctx, x + 44, y + 57, 8, 5, "#171d29");
  },
  flowerPatch(ctx, x, y, asset) {
    const color = asset.color || "#f02ea5";
    [[13, 24], [27, 15], [42, 28], [20, 42], [48, 47], [34, 51]].forEach(([px, py], index) => {
      pixel(ctx, x + px, y + py, 3, 12, "#2b9a68");
      pixel(ctx, x + px - 3, y + py - 3, 9, 7, index % 2 ? "#f4d06f" : color);
    });
  },
  obelisk(ctx, x, y, asset) {
    pixel(ctx, x + 14, y + 54, 36, 8, "#242b3c");
    pixel(ctx, x + 21, y + 18, 22, 38, asset.color || "#4e426a");
    pixel(ctx, x + 26, y + 6, 12, 17, "#685481");
    pixel(ctx, x + 29, y + 27, 6, 17, "#42efd4");
    pixel(ctx, x + 27, y + 32, 10, 6, "#f02ea5");
  },
};

export function drawPlacedRoomAsset(ctx, asset, screenX, screenY) {
  const categories = asset.category
    ? [asset.category]
    : ["props", "characters", "buildings"];
  if (categories.some((category) => (
    drawCatalogArt(ctx, category, asset.type, screenX, screenY, TILE, TILE)
  ))) return;
  DRAW[asset.type]?.(ctx, screenX, screenY, asset);
}

export function visibleRoomAssets(mapId, cameraX, cameraY, viewWidth, viewHeight) {
  // Include neighboring rooms because buildings and trees can overhang an edge.
  const firstRoomX = Math.max(0, Math.floor((cameraX - 256) / (SCREEN_COLS * TILE)));
  const firstRoomY = Math.max(0, Math.floor((cameraY - 256) / (SCREEN_ROWS * TILE)));
  const lastRoomX = Math.floor((cameraX + viewWidth) / (SCREEN_COLS * TILE));
  const lastRoomY = Math.floor((cameraY + viewHeight) / (SCREEN_ROWS * TILE));
  const visible = [];
  for (let roomY = firstRoomY; roomY <= lastRoomY; roomY += 1) {
    for (let roomX = firstRoomX; roomX <= lastRoomX; roomX += 1) {
      roomAssetsAt(mapId, roomX, roomY).forEach((asset) => {
        visible.push({
          ...asset,
          worldX: (roomX * SCREEN_COLS + asset.x) * TILE,
          worldY: (roomY * SCREEN_ROWS + asset.y) * TILE,
        });
      });
    }
  }
  return visible;
}
