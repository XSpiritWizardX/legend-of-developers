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
      },
      {
        id: "silverwater-reach",
        name: "Silverwater Reach",
        bounds: { x: 64, y: 20, width: 64, height: 60 },
        camera: CAMERA_MODE.CLAMPED_FOLLOW,
        kind: "outdoorRegion",
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
    // Rootbound is the first dungeon fully migrated away from fixed 16x10
    // screen identity. These chambers deliberately mix dimensions while
    // preserving the existing 48x30 tile coordinates for save compatibility.
    rooms: [
      {
        id: "d01-west-gallery",
        name: "Rootbound West Gallery",
        bounds: { x: 0, y: 0, width: 16, height: 10 },
        camera: CAMERA_MODE.SNAP,
        kind: "smallChamber",
        connections: [
          { edge: "east", to: "d01-grand-nave" },
          { edge: "south", to: "d01-lower-crypt" },
        ],
      },
      {
        id: "d01-grand-nave",
        name: "Rootbound Grand Nave",
        bounds: { x: 16, y: 0, width: 32, height: 10 },
        camera: CAMERA_MODE.CLAMPED_FOLLOW,
        kind: "wideHall",
        connections: [
          { edge: "west", to: "d01-west-gallery" },
          { edge: "south", to: "d01-lower-crypt", span: { from: 16, to: 23 } },
          { edge: "south", to: "d01-root-sanctum", span: { from: 24, to: 47 } },
        ],
      },
      {
        id: "d01-lower-crypt",
        name: "Rootbound Lower Crypt",
        bounds: { x: 0, y: 10, width: 24, height: 20 },
        camera: CAMERA_MODE.CLAMPED_FOLLOW,
        kind: "mediumChamber",
        connections: [
          { edge: "north", to: "d01-west-gallery", span: { from: 0, to: 15 } },
          { edge: "north", to: "d01-grand-nave", span: { from: 16, to: 23 } },
          { edge: "east", to: "d01-root-sanctum" },
        ],
      },
      {
        id: "d01-root-sanctum",
        name: "Rootbound Sanctum",
        bounds: { x: 24, y: 10, width: 24, height: 20 },
        camera: CAMERA_MODE.CLAMPED_FOLLOW,
        kind: "bossChamber",
        connections: [
          { edge: "north", to: "d01-grand-nave" },
          { edge: "west", to: "d01-lower-crypt" },
        ],
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

export function authoredConnectionsForRoom(mapId, roomId) {
  const room = layoutForMap(mapId).rooms.find((entry) => entry.id === roomId);
  return room ? [...(room.connections || [])] : [];
}

export { WORLD_LAYOUTS };
