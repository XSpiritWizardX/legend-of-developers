import { cameraForRoom } from "./roomGeometry";
import { logicalRoomAtPixel } from "./worldLayout";

export function resolveRoomRuntime({
  mapId,
  player,
  viewport,
  tileSize,
  previousCamera = { x: 0, y: 0 },
}) {
  const room = logicalRoomAtPixel(mapId, player.x, player.y, tileSize);
  const targetCamera = cameraForRoom({
    room,
    player,
    viewport,
    tileSize,
    previousCamera,
  });

  return {
    room,
    targetCamera: { x: targetCamera.x, y: targetCamera.y },
    discoveryKey: `${mapId}:room:${room.id}`,
    title: room.name,
    usesLegacyTransitions: Boolean(room.legacy || room.useLegacyTransitions),
  };
}

export function legacyScreenForPlayer(player, viewport) {
  return {
    x: Math.floor(player.x / viewport.width),
    y: Math.floor(player.y / viewport.height),
  };
}

export function roomRuntimeIdentity(mapId, player, runtime, viewport) {
  if (!runtime?.room?.id) return null;
  if (!runtime.usesLegacyTransitions) return runtime.room.id;
  const screen = legacyScreenForPlayer(player, viewport);
  return `${mapId}:${runtime.room.id}:screen:${screen.x},${screen.y}`;
}

export function legacyCameraTarget(player, map, viewport) {
  const screen = legacyScreenForPlayer(player, viewport);
  const maxX = Math.max(0, map.width - viewport.width);
  const maxY = Math.max(0, map.height - viewport.height);
  return {
    x: Math.min(screen.x * viewport.width, maxX),
    y: Math.min(screen.y * viewport.height, maxY),
  };
}

export function roomChanged(previousRoomId, runtime) {
  return Boolean(runtime?.room?.id) && runtime.room.id !== previousRoomId;
}

export function smoothCamera(current, target, dt, response = 16) {
  const safeDt = Math.max(0, Math.min(0.05, dt || 0));
  const amount = 1 - Math.exp(-Math.max(0, response) * safeDt);
  return {
    x: current.x + (target.x - current.x) * amount,
    y: current.y + (target.y - current.y) * amount,
  };
}

export function settleCamera(target) {
  return { x: target.x, y: target.y };
}
