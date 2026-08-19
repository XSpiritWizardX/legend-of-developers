import { CAMERA_MODE, legacyScreenRoom, selectLogicalRoom } from "./roomGeometry";

const WORLD_LAYOUTS = {
  overworld: {
    regions: [
      {
        id: "greenwood-vale",
        name: "Greenwood Vale",
        bounds: { x: 0, y: 0, width: 64, height: 40 },
        camera: CAMERA_MODE.CLAMPED_FOLLOW,
        kind: "outdoorRegion",
        // Region-scale scrolling is intentionally staged until the internal
        // fixed-screen walls have been re-authored into a continuous zone.
        useLegacyTransitions: true,
      },
      {
        id: "silverwater-reach",
        name: "Silverwater Reach",
        bounds: { x: 64, y: 20, width: 64, height: 60 },
        camera: CAMERA_MODE.CLAMPED_FOLLOW,
        kind: "outdoorRegion",
        useLegacyTransitions: true,
      },
    ],
    rooms: [
      {
        id: "heros-grove",
        name: "Hero's Grove",
        bounds: { x: 16, y: 0, width: 16, height: 10 },
        camera: CAMERA_MODE.SNAP,
        priority: 10,
        kind: "clearing",
      },
      {
        id: "willowbrook-village",
        name: "Willowbrook Village",
        bounds: { x: 16, y: 10, width: 32, height: 20 },
        camera: CAMERA_MODE.CLAMPED_FOLLOW,
        priority: 8,
        kind: "settlement",
      },
      {
        id: "oldgrowth-ascent",
        name: "Oldgrowth Ascent",
        bounds: { x: 48, y: 0, width: 16, height: 20 },
        camera: CAMERA_MODE.CLAMPED_FOLLOW,
        priority: 8,
        kind: "verticalOutdoor",
      },
    ],
  },
  willowCave: {
    regions: [],
    rooms: [
      {
        id: "willowbrook-hollow",
        name: "Willowbrook Hollow",
        bounds: { x: 0, y: 0, width: 12, height: 8 },
        camera: CAMERA_MODE.SNAP,
        priority: 50,
        kind: "smallInterior",
      },
    ],
  },
  d01: {
    regions: [],
    // This partition deliberately mixes room sizes. It occupies the same
    // existing 48x30-tile dungeon map, so saves/world coordinates remain valid.
    // Runtime camera activation stays staged until the dungeon tile boundaries
    // and doorway spans are re-authored for these logical chambers.
    rooms: [
      {
        id: "d01-west-gallery",
        name: "Rootbound West Gallery",
        bounds: { x: 0, y: 0, width: 16, height: 10 },
        camera: CAMERA_MODE.SNAP,
        kind: "smallChamber",
        useLegacyTransitions: true,
      },
      {
        id: "d01-grand-nave",
        name: "Rootbound Grand Nave",
        bounds: { x: 16, y: 0, width: 32, height: 10 },
        camera: CAMERA_MODE.CLAMPED_FOLLOW,
        kind: "wideHall",
        useLegacyTransitions: true,
      },
      {
        id: "d01-lower-crypt",
        name: "Rootbound Lower Crypt",
        bounds: { x: 0, y: 10, width: 24, height: 20 },
        camera: CAMERA_MODE.CLAMPED_FOLLOW,
        kind: "mediumChamber",
        useLegacyTransitions: true,
      },
      {
        id: "d01-root-sanctum",
        name: "Rootbound Sanctum",
        bounds: { x: 24, y: 10, width: 24, height: 20 },
        camera: CAMERA_MODE.CLAMPED_FOLLOW,
        kind: "bossChamber",
        useLegacyTransitions: true,
      },
    ],
  },
};

export function layoutForMap(mapId) {
  return WORLD_LAYOUTS[mapId] || { regions: [], rooms: [] };
}

export function logicalRoomAtTile(mapId, tileX, tileY) {
  const layout = layoutForMap(mapId);
  return selectLogicalRoom(layout.rooms, tileX, tileY)
    || selectLogicalRoom(layout.regions, tileX, tileY)
    || legacyScreenRoom({ mapId, tileX, tileY });
}

export function logicalRoomAtPixel(mapId, x, y, tileSize) {
  return logicalRoomAtTile(mapId, Math.floor(x / tileSize), Math.floor(y / tileSize));
}

export function authoredRoomsForMap(mapId) {
  return [...layoutForMap(mapId).rooms];
}

export function authoredRegionsForMap(mapId) {
  return [...layoutForMap(mapId).regions];
}

export { WORLD_LAYOUTS };
