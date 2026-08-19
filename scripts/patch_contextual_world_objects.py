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
    'import {\n  TERRAIN, TRAVERSAL_STATE, canHopLedge, isDirectionalLedge,\n  ledgeLandingPoint, recoveryPoint, rememberSafeGround, terrainTraversalFor,\n} from "./terrainInteractions";\n',
    'import {\n  TERRAIN, TRAVERSAL_STATE, canHopLedge, isDirectionalLedge,\n  ledgeLandingPoint, recoveryPoint, rememberSafeGround, terrainTraversalFor,\n} from "./terrainInteractions";\nimport {\n  WORLD_OBJECT_KIND, activeWorldObjects, breakableBySword, canLiftWorldObject,\n  facingWorldObject, moveWorldObject, pushDestination, removeWorldObject,\n  worldObjectAtPoint,\n} from "./worldObjects";\n',
    "world object imports",
)

engine = replace_once(
    engine,
    '  let traversal = null;\n  let safeGroundHistory = [];\n  let lastSafeTile = null;\n',
    '  let traversal = null;\n  let safeGroundHistory = [];\n  let lastSafeTile = null;\n  let carriedObject = null;\n  let thrownObject = null;\n',
    "world object runtime state",
)

engine = replace_once(
    engine,
    '  function solidAt(x, y) {\n    const tileX = Math.floor(x / TILE);\n    const tileY = Math.floor(y / TILE);\n    if (roomAssetSolidAt(state.mapId, x, y)) return true;\n',
    '  function currentWorldObjects() {\n    return activeWorldObjects(state.mapId, state.flags, TILE)\n      .filter((object) => object.id !== carriedObject?.id);\n  }\n  function solidAt(x, y) {\n    const tileX = Math.floor(x / TILE);\n    const tileY = Math.floor(y / TILE);\n    if (roomAssetSolidAt(state.mapId, x, y)) return true;\n    if (worldObjectAtPoint(currentWorldObjects(), x, y, 24)) return true;\n',
    "world object collision",
)

engine = replace_once(
    engine,
    '  function changeMap(mapId, position) {\n    state.mapId = mapId;\n',
    '  function changeMap(mapId, position) {\n    carriedObject = null;\n    thrownObject = null;\n    state.mapId = mapId;\n',
    "drop transient objects on map change",
)

engine = replace_once(
    engine,
    '  function interact() {\n    const currentMap = map();\n',
    '''  function interactionDirection() {
    return spriteDirection(player.dir);
  }
  function worldObjectDestinationOpen(object, destination) {
    const x = destination.tx * TILE + TILE / 2;
    const y = destination.ty * TILE + TILE / 2;
    const tile = tileAt(state.mapId, destination.tx, destination.ty, state.flags);
    if (isSolid(tile) || tile === TERRAIN.PIT || isDirectionalLedge(tile)) return false;
    if (roomAssetSolidAt(state.mapId, x, y)) return false;
    return !worldObjectAtPoint(currentWorldObjects(), x, y, 34, object.id);
  }
  function throwCarriedWorldObject() {
    if (!carriedObject) return false;
    const dir = directionVector();
    const object = carriedObject;
    carriedObject = null;
    removeWorldObject(state.flags, object.id);
    thrownObject = {
      ...object,
      fromX: player.x,
      fromY: player.y - 16,
      x: player.x,
      y: player.y - 16,
      toX: player.x + dir.x * 112,
      toY: player.y + dir.y * 112,
      elapsed: 0,
      duration: 0.36,
    };
    announce(`THREW ${object.kind.toUpperCase()}`, 1.2);
    save();
    return true;
  }
  function interactWorldObject() {
    if (carriedObject) return throwCarriedWorldObject();
    const direction = interactionDirection();
    const object = facingWorldObject({
      objects: currentWorldObjects(),
      player,
      direction,
      distance: 44,
      radius: 34,
    });
    if (!object) return false;
    if (canLiftWorldObject(object, player.inventory)) {
      carriedObject = object;
      announce(`LIFTED ${object.kind.toUpperCase()} · L TO THROW`, 1.8);
      return true;
    }
    if (object.pushable) {
      const destination = pushDestination(object, direction);
      if (!destination || !worldObjectDestinationOpen(object, destination)) {
        announce("IT WILL NOT BUDGE THAT WAY", 1.4);
        return true;
      }
      moveWorldObject(state.flags, object.id, destination.tx, destination.ty);
      screenShake = Math.max(screenShake, 3);
      spawnParticles(object.x, object.y, "#9ea29f", 6, 70);
      announce(player.inventory.glove ? "HEAVY ROCK MOVED" : "PUSHED THE HEAVY ROCK", 1.4);
      save();
      return true;
    }
    if (object.cuttable) {
      announce("THIS BRUSH CAN BE CUT WITH YOUR SWORD", 1.5);
      return true;
    }
    return false;
  }

  function interact() {
    if (interactWorldObject()) return;
    const currentMap = map();
''',
    "contextual world object interaction",
)

engine = replace_once(
    engine,
    '    enemiesByMap[state.mapId].forEach((enemy) => {\n      const dx = enemy.x - player.x;\n      const dy = enemy.y - player.y;\n',
    '    let brokeWorldObject = false;\n    currentWorldObjects().forEach((object) => {\n      if (!breakableBySword(object)) return;\n      const objectDx = object.x - player.x;\n      const objectDy = object.y - player.y;\n      const objectDistance = Math.hypot(objectDx, objectDy);\n      const objectAngle = Math.atan2(objectDy, objectDx);\n      const facingAngle = Math.atan2(dir.y, dir.x);\n      const angleDifference = Math.abs(Math.atan2(\n        Math.sin(objectAngle - facingAngle),\n        Math.cos(objectAngle - facingAngle),\n      ));\n      if (objectDistance <= swordReach + 24 && angleDifference <= 1.08) {\n        removeWorldObject(state.flags, object.id);\n        spawnParticles(\n          object.x, object.y,\n          object.kind === WORLD_OBJECT_KIND.POT ? "#d89467" : "#68aa68",\n          12, 130,\n        );\n        if (object.kind === WORLD_OBJECT_KIND.POT) player.coins += 1;\n        brokeWorldObject = true;\n      }\n    });\n    if (brokeWorldObject) save();\n    enemiesByMap[state.mapId].forEach((enemy) => {\n      const dx = enemy.x - player.x;\n      const dy = enemy.y - player.y;\n',
    "sword world object breaking",
)

engine = replace_once(
    engine,
    '  function updateProjectiles(dt) {\n    cssPulses.forEach((pulse) => {\n',
    '''  function updateThrownWorldObject(dt) {
    if (!thrownObject) return;
    const object = thrownObject;
    object.elapsed += dt;
    const progress = Math.min(1, object.elapsed / object.duration);
    const eased = progress * progress * (3 - 2 * progress);
    object.x = object.fromX + (object.toX - object.fromX) * eased;
    object.y = object.fromY + (object.toY - object.fromY) * eased;
    if (progress < 1) return;
    enemiesByMap[state.mapId].forEach((enemy) => {
      if (Math.hypot(enemy.x - object.x, enemy.y - object.y) < 55) {
        damageEnemy(enemy, object.kind === WORLD_OBJECT_KIND.ROCK ? 4 : 2);
      }
    });
    spawnParticles(
      object.x, object.y,
      object.kind === WORLD_OBJECT_KIND.ROCK ? "#9ea29f" : "#d89467",
      18, 170,
    );
    screenShake = Math.max(screenShake, object.kind === WORLD_OBJECT_KIND.ROCK ? 8 : 5);
    thrownObject = null;
  }

  function updateProjectiles(dt) {
    updateThrownWorldObject(dt);
    cssPulses.forEach((pulse) => {
''',
    "thrown world object update",
)

engine = replace_once(
    engine,
    '      const moveSpeed = player.speed;\n',
    '      const moveSpeed = player.speed * (carriedObject ? 0.82 : 1);\n',
    "carrying movement penalty",
)

engine = replace_once(
    engine,
    '  function drawDepthSortedActors() {\n    const renderables = visibleRoomAssets(state.mapId, camera.x, camera.y, VIEW_W, VIEW_H)\n',
    '''  function drawWorldObject(object, x = screenX(object.x), y = screenY(object.y), carried = false) {
    ctx.save();
    const shadowY = carried ? y + 18 : y + 12;
    ctx.fillStyle = "#02060a66";
    ctx.beginPath();
    ctx.ellipse(x, shadowY, carried ? 12 : 18, carried ? 4 : 6, 0, 0, Math.PI * 2);
    ctx.fill();
    if (object.kind === WORLD_OBJECT_KIND.POT) {
      rect(x - 15, y - 18, 30, 27, "#985334");
      rect(x - 18, y - 20, 36, 7, "#d08352");
      rect(x - 11, y - 13, 22, 4, "#bd7045");
      rect(x - 8, y + 5, 16, 4, "#5e382b");
    } else if (object.kind === WORLD_OBJECT_KIND.ROCK) {
      rect(x - 20, y - 18, 40, 30, "#686e72");
      rect(x - 14, y - 24, 28, 11, "#898e8d");
      rect(x - 13, y - 10, 10, 5, "#4a4e53");
      rect(x + 5, y - 4, 11, 4, "#4a4e53");
    } else {
      rect(x - 18, y - 10, 36, 22, "#285538");
      rect(x - 12, y - 18, 24, 25, "#43804b");
      rect(x - 21, y - 2, 16, 13, "#397343");
      rect(x + 6, y - 4, 16, 14, "#397343");
      rect(x - 2, y - 22, 5, 34, "#5b8f50");
    }
    ctx.restore();
  }
  function drawDepthSortedActors() {
    const renderables = visibleRoomAssets(state.mapId, camera.x, camera.y, VIEW_W, VIEW_H)
''',
    "world object renderer",
)

engine = replace_once(
    engine,
    '    enemiesByMap[state.mapId].forEach((enemy) => {\n      renderables.push({ sortY: enemy.y + 15, draw: () => drawEnemy(enemy) });\n    });\n    renderables.push({ sortY: player.y + 15, draw: drawPlayer });\n',
    '''    currentWorldObjects().forEach((object) => {
      renderables.push({
        sortY: object.y + 14,
        draw: () => drawWorldObject(object),
      });
    });
    enemiesByMap[state.mapId].forEach((enemy) => {
      renderables.push({ sortY: enemy.y + 15, draw: () => drawEnemy(enemy) });
    });
    renderables.push({ sortY: player.y + 15, draw: drawPlayer });
    if (carriedObject) {
      renderables.push({
        sortY: player.y + 15.5,
        draw: () => drawWorldObject(
          carriedObject,
          screenX(player.x),
          screenY(player.y) - 54,
          true,
        ),
      });
    }
    if (thrownObject) {
      const progress = Math.min(1, thrownObject.elapsed / thrownObject.duration);
      const arc = Math.sin(progress * Math.PI) * 42;
      renderables.push({
        sortY: thrownObject.y + 15,
        draw: () => drawWorldObject(
          thrownObject,
          screenX(thrownObject.x),
          screenY(thrownObject.y) - arc,
          true,
        ),
      });
    }
''',
    "depth sorted world objects",
)

ENGINE.write_text(engine)
