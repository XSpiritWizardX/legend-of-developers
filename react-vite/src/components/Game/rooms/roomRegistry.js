const overworldModules = import.meta.glob("./overworld/*.js", {
  eager: true,
  import: "default",
});
const dungeonModules = import.meta.glob("./dungeons/**/*.js", {
  eager: true,
  import: "default",
});

function createRegistry(modules) {
  return Object.values(modules).reduce((registry, room) => {
    registry[room.id] = room;
    return registry;
  }, {});
}

const overworldRooms = createRegistry(overworldModules);
const dungeonRooms = createRegistry(dungeonModules);

const FANTASY_ASSET_REPLACEMENTS = {
  serverRack: "forestTree",
  terminal: "villageSign",
  neonSign: "villageSign",
  codeCrate: "forestStump",
  dataPlant: "forestBush",
  streetLamp: "villageLamp",
  holoTable: "villageWell",
  pipeCluster: "forestBush",
  debugStatue: "forestStump",
  cyberTree: "forestTree",
  boulder: "forestStump",
  fountain: "villageWell",
  marketStall: "villageShop",
  satelliteDish: "forestTree",
  solarPanel: "forestBush",
  windTurbine: "forestTree",
  dumpster: "forestLog",
  flowerPatch: "forestFlowers",
  obelisk: "forestStump",
};

const DUNGEON_ASSET_REPLACEMENTS = {
  serverRack: "dungeonPillar",
  terminal: "caveTorch",
  neonSign: "dungeonStatue",
  codeCrate: "dungeonPot",
  dataPlant: "crystalSmall",
  streetLamp: "caveTorch",
  holoTable: "dungeonSwitch",
  pipeCluster: "caveStalagmite",
  debugStatue: "dungeonStatue",
  boulder: "caveStalagmite",
  satelliteDish: "crystalLarge",
  dumpster: "caveBones",
  obelisk: "crystalLarge",
};

export function editableRoomAt(mapId, roomX, roomY) {
  const id = `${roomX},${roomY}`;
  return mapId === "overworld" ? overworldRooms[id] : dungeonRooms[`${mapId}:${id}`];
}

export function roomAssetsAt(mapId, roomX, roomY) {
  const assets = editableRoomAt(mapId, roomX, roomY)?.assets || [];
  if (mapId !== "overworld") {
    if (!mapId.startsWith("d")) return assets;
    return assets.map((asset) => {
      const fantasyType = DUNGEON_ASSET_REPLACEMENTS[asset.type];
      return fantasyType ? { ...asset, type: fantasyType, text: undefined } : asset;
    });
  }
  return assets.map((asset) => {
    const fantasyType = FANTASY_ASSET_REPLACEMENTS[asset.type];
    if (!fantasyType) return asset;
    const collision = fantasyType === "villageShop"
      ? { left: 2, right: 2, top: 1, bottom: 0 }
      : asset.collision;
    return {
      ...asset,
      type: fantasyType,
      text: undefined,
      collision,
    };
  });
}
