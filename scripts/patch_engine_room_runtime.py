from pathlib import Path

ENGINE = Path("react-vite/src/components/Game/engine.js")
text = ENGINE.read_text()


def replace_once(old, new, label):
    global text
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected exactly one match, found {count}")
    text = text.replace(old, new, 1)


replace_once(
    'import { indexedRoomTileAt } from "./art/tileIndex";\n',
    'import { indexedRoomTileAt } from "./art/tileIndex";\n'
    'import {\n'
    '  resolveRoomRuntime, roomChanged, settleCamera, smoothCamera,\n'
    '} from "./roomRuntime";\n',
    "room runtime import",
)

replace_once(
    '  let roomTitle = "";\n'
    '  let roomTitleTime = 0;\n'
    '  let debugReturnPosition = { ...MAPS.overworld.spawn };\n',
    '  let roomTitle = "";\n'
    '  let roomTitleTime = 0;\n'
    '  let activeRoomId = null;\n'
    '  let debugReturnPosition = { ...MAPS.overworld.spawn };\n',
    "active room state",
)

replace_once(
    '  function markCurrentScreenDiscovered() {\n'
    '    const screenXIndex = Math.floor(player.x / VIEW_W);\n'
    '    const screenYIndex = Math.floor(player.y / VIEW_H);\n'
    '    state.discovered[`${state.mapId}:${screenXIndex},${screenYIndex}`] = true;\n'
    '  }\n',
    '  const viewport = { width: VIEW_W, height: VIEW_H };\n'
    '  function currentRoomRuntime(previousCamera = camera) {\n'
    '    return resolveRoomRuntime({\n'
    '      mapId: state.mapId,\n'
    '      player,\n'
    '      viewport,\n'
    '      tileSize: TILE,\n'
    '      previousCamera,\n'
    '    });\n'
    '  }\n'
    '  function legacyCameraForPlayer(mapId = state.mapId) {\n'
    '    const targetMap = MAPS[mapId];\n'
    '    return {\n'
    '      x: Math.min(\n'
    '        Math.floor(player.x / VIEW_W) * VIEW_W,\n'
    '        Math.max(0, targetMap.width * TILE - VIEW_W),\n'
    '      ),\n'
    '      y: Math.min(\n'
    '        Math.floor(player.y / VIEW_H) * VIEW_H,\n'
    '        Math.max(0, targetMap.height * TILE - VIEW_H),\n'
    '      ),\n'
    '    };\n'
    '  }\n'
    '  function legacyDiscoveryKey() {\n'
    '    const screenXIndex = Math.floor(player.x / VIEW_W);\n'
    '    const screenYIndex = Math.floor(player.y / VIEW_H);\n'
    '    return `${state.mapId}:${screenXIndex},${screenYIndex}`;\n'
    '  }\n'
    '  function markCurrentRoomDiscovered(runtime = currentRoomRuntime()) {\n'
    '    state.discovered[runtime.discoveryKey] = true;\n'
    '    // Keep the old screen key populated while the map overlay migrates to\n'
    '    // logical-room geometry. Existing saves therefore remain compatible.\n'
    '    state.discovered[legacyDiscoveryKey()] = true;\n'
    '    return runtime;\n'
    '  }\n'
    '  function roomRuntimeTitle(runtime = currentRoomRuntime()) {\n'
    '    return runtime.usesLegacyTransitions\n'
    '      ? roomNameAt(state.mapId, player.x, player.y)\n'
    '      : runtime.title;\n'
    '  }\n',
    "room runtime helpers",
)

replace_once(
    '  camera.x = Math.min(\n'
    '    Math.floor(player.x / VIEW_W) * VIEW_W,\n'
    '    Math.max(0, map().width * TILE - VIEW_W),\n'
    '  );\n'
    '  camera.y = Math.min(\n'
    '    Math.floor(player.y / VIEW_H) * VIEW_H,\n'
    '    Math.max(0, map().height * TILE - VIEW_H),\n'
    '  );\n'
    '  markCurrentScreenDiscovered();\n',
    '  const initialRuntime = currentRoomRuntime(camera);\n'
    '  camera = initialRuntime.usesLegacyTransitions\n'
    '    ? legacyCameraForPlayer()\n'
    '    : settleCamera(initialRuntime.targetCamera);\n'
    '  activeRoomId = initialRuntime.room.id;\n'
    '  markCurrentRoomDiscovered(initialRuntime);\n',
    "initial camera",
)

replace_once(
    '  announce(\n'
    '    player.inventory.htmlSword\n'
    '      ? roomNameAt(state.mapId, player.x, player.y).toUpperCase()\n'
    '      : "OBJECTIVE: FIND THE HTML SWORD IN HERO\'S GROVE",\n'
    '    4,\n'
    '  );\n'
    '  showRoomTitle();\n',
    '  announce(\n'
    '    player.inventory.htmlSword\n'
    '      ? roomRuntimeTitle(initialRuntime).toUpperCase()\n'
    '      : "OBJECTIVE: FIND THE HTML SWORD IN HERO\'S GROVE",\n'
    '    4,\n'
    '  );\n'
    '  showRoomTitle(initialRuntime);\n',
    "initial room title",
)

replace_once(
    '  function showRoomTitle() {\n'
    '    roomTitle = roomNameAt(state.mapId, player.x, player.y).toUpperCase();\n'
    '    roomTitleTime = 2.6;\n'
    '  }\n',
    '  function showRoomTitle(runtime = currentRoomRuntime()) {\n'
    '    roomTitle = roomRuntimeTitle(runtime).toUpperCase();\n'
    '    roomTitleTime = 2.6;\n'
    '  }\n',
    "room title helper",
)

replace_once(
    '    camera.x = Math.min(\n'
    '      Math.floor(player.x / VIEW_W) * VIEW_W,\n'
    '      Math.max(0, MAPS[mapId].width * TILE - VIEW_W),\n'
    '    );\n'
    '    camera.y = Math.min(\n'
    '      Math.floor(player.y / VIEW_H) * VIEW_H,\n'
    '      Math.max(0, MAPS[mapId].height * TILE - VIEW_H),\n'
    '    );\n'
    '    respawnRoomEnemies(mapId, camera.x, camera.y);\n'
    '    screenTransition = null;\n'
    '    markCurrentScreenDiscovered();\n'
    '    showRoomTitle();\n',
    '    const runtime = currentRoomRuntime(camera);\n'
    '    camera = runtime.usesLegacyTransitions\n'
    '      ? legacyCameraForPlayer(mapId)\n'
    '      : settleCamera(runtime.targetCamera);\n'
    '    activeRoomId = runtime.room.id;\n'
    '    respawnRoomEnemies(mapId, camera.x, camera.y);\n'
    '    screenTransition = null;\n'
    '    markCurrentRoomDiscovered(runtime);\n'
    '    showRoomTitle(runtime);\n',
    "map change camera",
)

replace_once(
    '        respawnRoomEnemies(state.mapId, camera.x, camera.y);\n'
    '        markCurrentScreenDiscovered();\n'
    '        showRoomTitle();\n'
    '        announce(roomNameAt(state.mapId, player.x, player.y).toUpperCase(), 1.4);\n',
    '        respawnRoomEnemies(state.mapId, camera.x, camera.y);\n'
    '        const runtime = markCurrentRoomDiscovered();\n'
    '        activeRoomId = runtime.room.id;\n'
    '        showRoomTitle(runtime);\n'
    '        announce(roomRuntimeTitle(runtime).toUpperCase(), 1.4);\n',
    "legacy transition completion",
)

replace_once(
    '    beginScreenTransitionIfNeeded();\n\n'
    '    // A small key opens the central dungeon door when approached.\n',
    '    const runtime = currentRoomRuntime(camera);\n'
    '    const changedRoom = roomChanged(activeRoomId, runtime);\n'
    '    if (runtime.usesLegacyTransitions) {\n'
    '      if (changedRoom) {\n'
    '        activeRoomId = runtime.room.id;\n'
    '        camera = legacyCameraForPlayer();\n'
    '        screenTransition = null;\n'
    '        respawnRoomEnemies(state.mapId, camera.x, camera.y);\n'
    '        markCurrentRoomDiscovered(runtime);\n'
    '        showRoomTitle(runtime);\n'
    '        announce(roomRuntimeTitle(runtime).toUpperCase(), 1.4);\n'
    '        save();\n'
    '      } else {\n'
    '        markCurrentRoomDiscovered(runtime);\n'
    '      }\n'
    '      beginScreenTransitionIfNeeded();\n'
    '    } else {\n'
    '      camera = smoothCamera(camera, runtime.targetCamera, dt);\n'
    '      markCurrentRoomDiscovered(runtime);\n'
    '      if (changedRoom) {\n'
    '        activeRoomId = runtime.room.id;\n'
    '        respawnRoomEnemies(state.mapId, camera.x, camera.y);\n'
    '        showRoomTitle(runtime);\n'
    '        announce(roomRuntimeTitle(runtime).toUpperCase(), 1.4);\n'
    '        save();\n'
    '      }\n'
    '    }\n\n'
    '    // A small key opens the central dungeon door when approached.\n',
    "per-frame camera routing",
)

replace_once(
    '    text(roomNameAt(state.mapId, player.x, player.y).toUpperCase(), VIEW_W / 2, 530, 12, "center", "#d5c89c");\n',
    '    text(roomRuntimeTitle().toUpperCase(), VIEW_W / 2, 530, 12, "center", "#d5c89c");\n',
    "map overlay room label",
)

replace_once(
    '    text(roomNameAt(state.mapId, player.x, player.y).toUpperCase(), 700, 55, 9, "right", "#c4bd9e");\n',
    '    text(roomRuntimeTitle().toUpperCase(), 700, 55, 9, "right", "#c4bd9e");\n',
    "hud room label",
)

if "markCurrentScreenDiscovered" in text:
    raise RuntimeError("legacy discovery helper reference remained after migration")

ENGINE.write_text(text)
print("engine.js logical-room runtime cutover applied")
