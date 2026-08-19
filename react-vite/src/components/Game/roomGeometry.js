export const CAMERA_MODE = Object.freeze({
  SNAP: "snap",
  FOLLOW: "follow",
  CLAMPED_FOLLOW: "clampedFollow",
  LOCKED: "locked",
});

export const ROOM_SIZE = Object.freeze({
  TINY: { width: 8, height: 6 },
  SMALL: { width: 12, height: 8 },
  STANDARD: { width: 16, height: 10 },
  MEDIUM: { width: 24, height: 12 },
  LARGE: { width: 32, height: 20 },
  GREAT_HALL: { width: 48, height: 20 },
});

export function normalizeRoomBounds(bounds) {
  const x = Math.floor(bounds?.x || 0);
  const y = Math.floor(bounds?.y || 0);
  const width = Math.max(1, Math.floor(bounds?.width || ROOM_SIZE.STANDARD.width));
  const height = Math.max(1, Math.floor(bounds?.height || ROOM_SIZE.STANDARD.height));
  return { x, y, width, height };
}

export function roomArea(room) {
  const bounds = normalizeRoomBounds(room.bounds);
  return bounds.width * bounds.height;
}

export function containsTile(room, tileX, tileY) {
  const bounds = normalizeRoomBounds(room.bounds);
  return tileX >= bounds.x && tileY >= bounds.y
    && tileX < bounds.x + bounds.width
    && tileY < bounds.y + bounds.height;
}

export function containsPixel(room, x, y, tileSize) {
  return containsTile(room, Math.floor(x / tileSize), Math.floor(y / tileSize));
}

export function pixelBounds(room, tileSize) {
  const bounds = normalizeRoomBounds(room.bounds);
  return {
    x: bounds.x * tileSize,
    y: bounds.y * tileSize,
    width: bounds.width * tileSize,
    height: bounds.height * tileSize,
  };
}

export function selectLogicalRoom(rooms, tileX, tileY) {
  const matches = (rooms || []).filter((room) => containsTile(room, tileX, tileY));
  if (!matches.length) return null;
  // More specific authored spaces win over broad outdoor regions. Priority can
  // override size when designers intentionally layer an interior/sub-room.
  return matches.sort((a, b) => {
    const priorityDelta = (b.priority || 0) - (a.priority || 0);
    return priorityDelta || roomArea(a) - roomArea(b);
  })[0];
}

function centerSmallAxis(start, size, viewportSize) {
  return start + (size - viewportSize) / 2;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function cameraForRoom({
  room,
  player,
  viewport,
  tileSize,
  previousCamera = { x: 0, y: 0 },
}) {
  const bounds = pixelBounds(room, tileSize);
  const mode = room.camera || CAMERA_MODE.CLAMPED_FOLLOW;
  const maxX = bounds.x + Math.max(0, bounds.width - viewport.width);
  const maxY = bounds.y + Math.max(0, bounds.height - viewport.height);
  const centeredX = centerSmallAxis(bounds.x, bounds.width, viewport.width);
  const centeredY = centerSmallAxis(bounds.y, bounds.height, viewport.height);

  if (mode === CAMERA_MODE.LOCKED || mode === CAMERA_MODE.SNAP) {
    return {
      x: bounds.width <= viewport.width ? centeredX : bounds.x,
      y: bounds.height <= viewport.height ? centeredY : bounds.y,
    };
  }

  if (mode === CAMERA_MODE.FOLLOW) {
    return {
      x: player.x - viewport.width / 2,
      y: player.y - viewport.height / 2,
    };
  }

  // Default: follow the player inside large rooms, but never reveal space
  // outside the authored room. Small rooms remain centered in the viewport.
  return {
    x: bounds.width <= viewport.width
      ? centeredX
      : clamp(player.x - viewport.width / 2, bounds.x, maxX),
    y: bounds.height <= viewport.height
      ? centeredY
      : clamp(player.y - viewport.height / 2, bounds.y, maxY),
    previousX: previousCamera.x,
    previousY: previousCamera.y,
  };
}

export function legacyScreenRoom({ mapId, tileX, tileY, screenCols = 16, screenRows = 10 }) {
  const roomX = Math.floor(tileX / screenCols);
  const roomY = Math.floor(tileY / screenRows);
  return {
    id: `${mapId}:legacy:${roomX},${roomY}`,
    name: `Legacy room ${roomX + 1},${roomY + 1}`,
    bounds: {
      x: roomX * screenCols,
      y: roomY * screenRows,
      width: screenCols,
      height: screenRows,
    },
    camera: CAMERA_MODE.SNAP,
    legacy: true,
  };
}
