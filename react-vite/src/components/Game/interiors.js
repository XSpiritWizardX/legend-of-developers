export const INTERIORS = Object.freeze([
  {
    id: "willowCave",
    name: "Willowbrook Hollow",
    entrance: { mapId: "overworld", tx: 37, ty: 16 },
    returnTo: { mapId: "overworld", tx: 37, ty: 17 },
    spawn: { tx: 6, ty: 6 },
    exit: { tx: 6, ty: 7 },
    size: { width: 12, height: 8 },
  },
]);

export function interiorByMapId(mapId) {
  return INTERIORS.find((interior) => interior.id === mapId) || null;
}

export function interiorEntranceNear({ mapId, x, y, tileSize = 64, radius = 78 }) {
  return INTERIORS.find((interior) => {
    if (interior.entrance.mapId !== mapId) return false;
    const entranceX = interior.entrance.tx * tileSize + tileSize / 2;
    const entranceY = interior.entrance.ty * tileSize + tileSize / 2;
    return Math.hypot(entranceX - x, entranceY - y) <= radius;
  }) || null;
}

export function interiorPixelPosition(position, tileSize = 64) {
  return {
    x: position.tx * tileSize + tileSize / 2,
    y: position.ty * tileSize + tileSize / 2,
  };
}
