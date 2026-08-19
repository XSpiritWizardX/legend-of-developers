from pathlib import Path

ENGINE = Path("react-vite/src/components/Game/engine.js")


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected exactly one anchor, found {count}")
    return text.replace(old, new, 1)


engine = ENGINE.read_text()
engine = replace_once(
    engine,
    'import {\n  resolveRoomRuntime, roomChanged, settleCamera, smoothCamera,\n} from "./roomRuntime";\n',
    'import {\n  legacyCameraTarget, resolveRoomRuntime, roomRuntimeIdentity, settleCamera, smoothCamera,\n} from "./roomRuntime";\n',
    "room runtime imports",
)
engine = replace_once(
    engine,
    '''  function legacyCameraForPlayer(mapId = state.mapId) {\n    const targetMap = MAPS[mapId];\n    return {\n      x: Math.min(\n        Math.floor(player.x / VIEW_W) * VIEW_W,\n        Math.max(0, targetMap.width * TILE - VIEW_W),\n      ),\n      y: Math.min(\n        Math.floor(player.y / VIEW_H) * VIEW_H,\n        Math.max(0, targetMap.height * TILE - VIEW_H),\n      ),\n    };\n  }\n''',
    '''  function legacyCameraForPlayer(mapId = state.mapId) {\n    const targetMap = MAPS[mapId];\n    return legacyCameraTarget(\n      player,\n      { width: targetMap.width * TILE, height: targetMap.height * TILE },\n      viewport,\n    );\n  }\n  function currentRoomIdentity(runtime = currentRoomRuntime()) {\n    return roomRuntimeIdentity(state.mapId, player, runtime, viewport);\n  }\n  function placePlayerInsideLegacyTarget(fromCamera, targetCamera) {\n    if (targetCamera.x > fromCamera.x + 1) player.x = targetCamera.x + 32;\n    if (targetCamera.x < fromCamera.x - 1) player.x = targetCamera.x + VIEW_W - 32;\n    if (targetCamera.y > fromCamera.y + 1) player.y = targetCamera.y + 32;\n    if (targetCamera.y < fromCamera.y - 1) player.y = targetCamera.y + VIEW_H - 32;\n  }\n''',
    "legacy camera helper",
)
engine = replace_once(
    engine,
    '  activeRoomId = initialRuntime.room.id;\n',
    '  activeRoomId = currentRoomIdentity(initialRuntime);\n',
    "initial room identity",
)
engine = replace_once(
    engine,
    '  function screenX(x) { return x - camera.x; }\n  function screenY(y) { return y - camera.y + HUD_H; }\n',
    '  function screenX(x) { return Math.round(x - camera.x); }\n  function screenY(y) { return Math.round(y - camera.y + HUD_H); }\n',
    "pixel snapped actor rendering",
)
engine = replace_once(
    engine,
    '        activeRoomId = runtime.room.id;\n        showRoomTitle(runtime);\n',
    '        activeRoomId = currentRoomIdentity(runtime);\n        showRoomTitle(runtime);\n',
    "transition completion identity",
)
old_runtime = '''    const runtime = currentRoomRuntime(camera);\n    const changedRoom = roomChanged(activeRoomId, runtime);\n    if (runtime.usesLegacyTransitions) {\n      if (changedRoom) {\n        activeRoomId = runtime.room.id;\n        camera = legacyCameraForPlayer();\n        screenTransition = null;\n        respawnRoomEnemies(state.mapId, camera.x, camera.y);\n        markCurrentRoomDiscovered(runtime);\n        showRoomTitle(runtime);\n        announce(roomRuntimeTitle(runtime).toUpperCase(), 1.4);\n        save();\n      } else {\n        markCurrentRoomDiscovered(runtime);\n      }\n      beginScreenTransitionIfNeeded();\n    } else {\n      camera = smoothCamera(camera, runtime.targetCamera, dt);\n      markCurrentRoomDiscovered(runtime);\n      if (changedRoom) {\n        activeRoomId = runtime.room.id;\n        respawnRoomEnemies(state.mapId, camera.x, camera.y);\n        showRoomTitle(runtime);\n        announce(roomRuntimeTitle(runtime).toUpperCase(), 1.4);\n        save();\n      }\n    }\n'''
new_runtime = '''    const runtime = currentRoomRuntime(camera);\n    const nextRoomIdentity = currentRoomIdentity(runtime);\n    const changedRoom = activeRoomId !== nextRoomIdentity;\n    if (runtime.usesLegacyTransitions) {\n      if (changedRoom) {\n        const targetCamera = legacyCameraForPlayer();\n        const fromCamera = { ...camera };\n        activeRoomId = nextRoomIdentity;\n        placePlayerInsideLegacyTarget(fromCamera, targetCamera);\n        markCurrentRoomDiscovered(runtime);\n        respawnRoomEnemies(state.mapId, targetCamera.x, targetCamera.y);\n        showRoomTitle(runtime);\n        announce(roomRuntimeTitle(runtime).toUpperCase(), 1.2);\n        if (Math.abs(targetCamera.x - camera.x) > 1 || Math.abs(targetCamera.y - camera.y) > 1) {\n          screenTransition = {\n            fromX: camera.x,\n            fromY: camera.y,\n            toX: targetCamera.x,\n            toY: targetCamera.y,\n            elapsed: 0,\n            duration: 0.42,\n          };\n        } else {\n          camera = targetCamera;\n        }\n        save();\n      } else {\n        markCurrentRoomDiscovered(runtime);\n        beginScreenTransitionIfNeeded();\n      }\n    } else {\n      camera = smoothCamera(camera, runtime.targetCamera, dt);\n      markCurrentRoomDiscovered(runtime);\n      if (changedRoom) {\n        activeRoomId = nextRoomIdentity;\n        respawnRoomEnemies(state.mapId, camera.x, camera.y);\n        showRoomTitle(runtime);\n        announce(roomRuntimeTitle(runtime).toUpperCase(), 1.2);\n        save();\n      }\n    }\n'''
engine = replace_once(engine, old_runtime, new_runtime, "runtime transition handoff")
engine = replace_once(
    engine,
    '        duration: 0.62,\n',
    '        duration: 0.42,\n',
    "legacy slide duration",
)
engine = replace_once(
    engine,
    '        const x = tx * TILE - camera.x;\n        const y = ty * TILE - camera.y + HUD_H;\n',
    '        const x = Math.round(tx * TILE - camera.x);\n        const y = Math.round(ty * TILE - camera.y + HUD_H);\n',
    "pixel snapped tile rendering",
)
ENGINE.write_text(engine)
