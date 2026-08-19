import { cameraForRoom } from "./roomGeometry";
import { logicalRoomAtPixel } from "./worldLayout";

export function legacyScreenForPlayer(player, viewport) {
  return {
    x: Math.floor(player.x / viewport.width),
    y: Math.floor(player.y / viewport.height),
  };
}

export function legacyScreenCamera(player, viewport) {
  const screen = legacyScreenForPlayer(player, viewport);
  return {
    x: screen.x * viewport.width,
    y: screen.y * viewport.height,
  };
}

function nearLegacyScreenEdge(player, targetCamera, viewport, inset = 36) {
  const localX = player.x - targetCamera.x;
  const localY = player.y - targetCamera.y;
  return localX < inset
    || localX > viewport.width - inset
    || localY < inset
    || localY > viewport.height - inset;
}

export function resolveRoomRuntime({
  mapId,
  player,
  viewport,
  tileSize,
  previousCamera = { x: 0, y: 0 },
}) {
  const room = logicalRoomAtPixel(mapId, player.x, player.y, tileSize);
  const configuredLegacyTransitions = Boolean(room.legacy || room.useLegacyTransitions);
  let targetCamera = cameraForRoom({
    room,
    player,
    viewport,
    tileSize,
    previousCamera,
  });
  let usesLegacyTransitions = configuredLegacyTransitions;
  let legacyHandoff = false;

  // Large authored rooms can border older fixed-screen regions. Previously the
  // engine snapped to the destination legacy camera first, then immediately
  // interpreted the player as standing at the opposite edge and transitioned
  // them back. During that boundary handoff we instead let the normal smooth
  // camera catch up to the destination screen. Legacy transitions turn back on
  // once the camera is aligned and the player has moved safely inside it.
  if (configuredLegacyTransitions) {
    const legacyTarget = legacyScreenCamera(player, viewport);
    const cameraMisaligned = Math.abs(previousCamera.x - legacyTarget.x) > 1
      || Math.abs(previousCamera.y - legacyTarget.y) > 1;
    if (cameraMisaligned && nearLegacyScreenEdge(player, legacyTarget, viewport)) {
      targetCamera = legacyTarget;
      usesLegacyTransitions = false;
      legacyHandoff = true;
    }
  }

  return {
    room,
    targetCamera: { x: targetCamera.x, y: targetCamera.y },
    discoveryKey: `${mapId}:room:${room.id}`,
    title: room.name,
    usesLegacyTransitions,
    legacyHandoff,
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
