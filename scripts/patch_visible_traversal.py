from pathlib import Path

WORLD = Path("react-vite/src/components/Game/world.js")
ENGINE = Path("react-vite/src/components/Game/engine.js")


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected exactly one anchor, found {count}")
    return text.replace(old, new, 1)


world = WORLD.read_text()
world = replace_once(
    world,
    'import { indexedRoomTileAt } from "./art/tileIndex";\n',
    'import { indexedRoomTileAt } from "./art/tileIndex";\nimport { showcaseTerrainAt } from "./showcaseTerrain";\n',
    "world showcase import",
)
world = replace_once(
    world,
    'export function tileAt(mapId, tx, ty, flags = {}) {\n  const map = MAPS[mapId];\n  if (tx < 0 || ty < 0 || tx >= map.width || ty >= map.height) return "void";\n  const indexedTile = indexedRoomTileAt(mapId, tx, ty);',
    'export function tileAt(mapId, tx, ty, flags = {}) {\n  const map = MAPS[mapId];\n  if (tx < 0 || ty < 0 || tx >= map.width || ty >= map.height) return "void";\n  const showcaseTile = showcaseTerrainAt(mapId, tx, ty);\n  if (showcaseTile) return showcaseTile;\n  const indexedTile = indexedRoomTileAt(mapId, tx, ty);',
    "world tile override",
)
world = replace_once(
    world,
    '      ["ow-heart-01", 4, 4, "heart"],\n',
    '      ["ow-heart-01", 4, 4, "heart"],\n      ["ow-cliff-heart", 26, 23, "heart"],\n',
    "showcase reward chest",
)
WORLD.write_text(world)

engine = ENGINE.read_text()
engine = replace_once(
    engine,
    'import {\n  resolveRoomRuntime, roomChanged, settleCamera, smoothCamera,\n} from "./roomRuntime";\n',
    'import {\n  resolveRoomRuntime, roomChanged, settleCamera, smoothCamera,\n} from "./roomRuntime";\nimport { showcaseTerrainAt } from "./showcaseTerrain";\nimport {\n  TERRAIN, TRAVERSAL_STATE, canHopLedge, isDirectionalLedge,\n  ledgeLandingPoint, recoveryPoint, rememberSafeGround, terrainTraversalFor,\n} from "./terrainInteractions";\n',
    "engine traversal imports",
)
engine = replace_once(
    engine,
    '  let roomTitleTime = 0;\n  let activeRoomId = null;\n  let debugReturnPosition = { ...MAPS.overworld.spawn };',
    '  let roomTitleTime = 0;\n  let activeRoomId = null;\n  let traversal = null;\n  let safeGroundHistory = [];\n  let lastSafeTile = null;\n  let debugReturnPosition = { ...MAPS.overworld.spawn };',
    "engine traversal state",
)
engine = replace_once(
    engine,
    '    walkTime: 0,\n  };\n  const enemiesByMap = {};',
    '    walkTime: 0,\n  };\n  safeGroundHistory = [{ x: player.x, y: player.y }];\n  const enemiesByMap = {};',
    "initial safe ground",
)
engine = replace_once(
    engine,
    '  function solidAt(x, y) {\n    const tileX = Math.floor(x / TILE);\n    const tileY = Math.floor(y / TILE);\n    if (roomAssetSolidAt(state.mapId, x, y)) return true;\n    const indexedTile = indexedRoomTileAt(state.mapId, tileX, tileY);',
    '  function solidAt(x, y) {\n    const tileX = Math.floor(x / TILE);\n    const tileY = Math.floor(y / TILE);\n    if (roomAssetSolidAt(state.mapId, x, y)) return true;\n    const showcaseTile = showcaseTerrainAt(state.mapId, tileX, tileY);\n    if (showcaseTile) {\n      if (showcaseTile === TERRAIN.DEEP_WATER && player.inventory.flippers) return false;\n      return isSolid(showcaseTile);\n    }\n    const indexedTile = indexedRoomTileAt(state.mapId, tileX, tileY);',
    "showcase collision override",
)
start = engine.index('  function canMove(x, y, dx = 0, dy = 0) {')
end = engine.index('  function enemyCanMove(enemy, x, y) {', start)
replacement = '''  function cardinalDirection(dx, dy) {
    if (!dx && !dy) return null;
    if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "right" : "left";
    return dy > 0 ? "down" : "up";
  }
  function terrainAtPoint(x, y) {
    return tileAt(state.mapId, Math.floor(x / TILE), Math.floor(y / TILE), state.flags);
  }
  function terrainBlocksAt(x, y, direction) {
    if (!direction) return false;
    return terrainTraversalFor({
      tile: terrainAtPoint(x, y),
      direction,
      hasFlippers: player.inventory.flippers,
    }).blocksMovement;
  }
  function canMove(x, y, dx = 0, dy = 0) {
    // The foot box remains compact, but terrain traversal can now make a tile
    // directional (one-way ledges) without turning the whole tile solid.
    const halfWidth = 11;
    const top = -4;
    const bottom = 15;
    const direction = cardinalDirection(dx, dy);
    const open = (px, py) => !solidAt(px, py) && !terrainBlocksAt(px, py, direction);
    if (dx > 0) {
      return open(x + halfWidth, y + top)
        && open(x + halfWidth, y + 6)
        && open(x + halfWidth, y + bottom);
    }
    if (dx < 0) {
      return open(x - halfWidth, y + top)
        && open(x - halfWidth, y + 6)
        && open(x - halfWidth, y + bottom);
    }
    if (dy > 0) {
      return open(x - halfWidth, y + bottom)
        && open(x, y + bottom)
        && open(x + halfWidth, y + bottom);
    }
    return open(x - halfWidth, y + top)
      && open(x, y + top)
      && open(x + halfWidth, y + top);
  }
  function recordSafeGround() {
    const footY = player.y + 10;
    const tile = terrainAtPoint(player.x, footY);
    if (tile === TERRAIN.PIT || tile === TERRAIN.DEEP_WATER || isDirectionalLedge(tile)) return;
    const tileX = Math.floor(player.x / TILE);
    const tileY = Math.floor(footY / TILE);
    const key = `${state.mapId}:${tileX},${tileY}`;
    if (key === lastSafeTile) return;
    lastSafeTile = key;
    safeGroundHistory = rememberSafeGround(safeGroundHistory, { x: player.x, y: player.y });
  }
  function startTerrainTraversal(direction) {
    if (traversal) return;
    const tile = terrainAtPoint(player.x, player.y + 10);
    if (tile === TERRAIN.PIT) {
      traversal = {
        state: TRAVERSAL_STATE.FALL,
        elapsed: 0,
        duration: 0.48,
        recover: recoveryPoint(safeGroundHistory, map().spawn),
      };
      player.moving = false;
      return;
    }
    if (!direction || !isDirectionalLedge(tile) || !canHopLedge(tile, direction)) return;
    const landing = ledgeLandingPoint({
      x: player.x,
      y: player.y,
      direction,
      tileSize: TILE,
    });
    if (solidAt(landing.x, landing.y)) return;
    traversal = {
      state: TRAVERSAL_STATE.HOP,
      elapsed: 0,
      duration: 0.30,
      from: { x: player.x, y: player.y },
      to: landing,
    };
  }
  function advanceTerrainTraversal(dt) {
    if (!traversal) return false;
    const activeTraversal = traversal;
    activeTraversal.elapsed += dt;
    const progress = Math.min(1, activeTraversal.elapsed / activeTraversal.duration);
    if (activeTraversal.state === TRAVERSAL_STATE.HOP) {
      const eased = progress * progress * (3 - 2 * progress);
      player.x = activeTraversal.from.x + (activeTraversal.to.x - activeTraversal.from.x) * eased;
      player.y = activeTraversal.from.y + (activeTraversal.to.y - activeTraversal.from.y) * eased;
      player.moving = true;
      if (progress >= 1) {
        traversal = null;
        recordSafeGround();
      }
      return true;
    }
    if (activeTraversal.state === TRAVERSAL_STATE.FALL) {
      player.moving = false;
      if (progress >= 1) {
        traversal = null;
        player.hp = Math.max(1, player.hp - 1);
        player.x = activeTraversal.recover.x;
        player.y = activeTraversal.recover.y;
        player.invincible = Math.max(player.invincible, 1.1);
        screenShake = Math.max(screenShake, 7);
        announce("YOU FELL · RETURNED TO SAFE GROUND", 2.2);
        recordSafeGround();
      }
      return true;
    }
    return false;
  }
'''
engine = engine[:start] + replacement + engine[end:]
engine = replace_once(
    engine,
    '      const indexedTile = indexedRoomTileAt(state.mapId, tileX, tileY);\n      return !roomAssetSolidAt(state.mapId, px, py)\n        && !(indexedTile?.solid\n          ?? isSolid(tileAt(state.mapId, tileX, tileY, state.flags)));',
    '      const showcaseTile = showcaseTerrainAt(state.mapId, tileX, tileY);\n      if (showcaseTile) {\n        if (showcaseTile === TERRAIN.PIT || isDirectionalLedge(showcaseTile)) return false;\n        return !roomAssetSolidAt(state.mapId, px, py) && !isSolid(showcaseTile);\n      }\n      const indexedTile = indexedRoomTileAt(state.mapId, tileX, tileY);\n      return !roomAssetSolidAt(state.mapId, px, py)\n        && !(indexedTile?.solid\n          ?? isSolid(tileAt(state.mapId, tileX, tileY, state.flags)));',
    "enemy traversal avoidance",
)
engine = replace_once(
    engine,
    '    state.mapId = mapId;\n    player.x = position.x;\n    player.y = position.y;\n    player.invincible = 1.5;',
    '    state.mapId = mapId;\n    player.x = position.x;\n    player.y = position.y;\n    traversal = null;\n    safeGroundHistory = [{ x: player.x, y: player.y }];\n    lastSafeTile = null;\n    player.invincible = 1.5;',
    "reset traversal on map change",
)
engine = replace_once(
    engine,
    '    player.attackTime = Math.max(0, player.attackTime - dt);',
    '    const traversing = advanceTerrainTraversal(dt);\n    player.attackTime = Math.max(0, player.attackTime - dt);',
    "advance traversal",
)
engine = replace_once(
    engine,
    '    let dx = (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0);\n    let dy = (keys.s || keys.arrowdown ? 1 : 0) - (keys.w || keys.arrowup ? 1 : 0);\n    player.moving = Boolean(dx || dy);\n    if (dx || dy) {',
    '    let dx = (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0);\n    let dy = (keys.s || keys.arrowdown ? 1 : 0) - (keys.w || keys.arrowup ? 1 : 0);\n    let moveDirection = null;\n    player.moving = traversing || Boolean(dx || dy);\n    if (!traversing && (dx || dy)) {',
    "gate walking during traversal",
)
engine = replace_once(
    engine,
    '      const length = Math.hypot(dx, dy);\n      dx /= length; dy /= length;',
    '      const length = Math.hypot(dx, dy);\n      dx /= length; dy /= length;\n      moveDirection = cardinalDirection(dx, dy);',
    "remember movement direction",
)
engine = replace_once(
    engine,
    '      player.walkTime += dt * 10;\n    }\n    if (pressed.j) activateItem(player.equippedSlots[0]);\n    if (pressed.k) activateItem(player.equippedSlots[1]);\n    if (pressed.shift) dash();\n    if (pressed.l) interact();',
    '      player.walkTime += dt * 10;\n    }\n    if (!traversing) {\n      recordSafeGround();\n      startTerrainTraversal(moveDirection);\n    }\n    if (!traversing && !traversal && pressed.j) activateItem(player.equippedSlots[0]);\n    if (!traversing && !traversal && pressed.k) activateItem(player.equippedSlots[1]);\n    if (!traversing && !traversal && pressed.shift) dash();\n    if (!traversing && !traversal && pressed.l) interact();',
    "terrain traversal trigger",
)
engine = replace_once(
    engine,
    '    callbackNode2: "#421b4d", snow: "#83e7eb", void: "#03040b",\n',
    '    callbackNode2: "#421b4d", snow: "#83e7eb", void: "#03040b",\n    ledgeDown: "#42563f", ledgeUp: "#42563f", ledgeLeft: "#42563f", ledgeRight: "#42563f",\n    pit: "#05070c", stairs: "#596169", ramp: "#52604d", deepWater: "#07354d",\n',
    "traversal tile palette",
)
engine = replace_once(
    engine,
    '        const indexedTile = indexedRoomTileAt(state.mapId, tx, ty);\n        const themedDungeonTiles = {',
    '        const indexedTile = indexedRoomTileAt(state.mapId, tx, ty);\n        const showcaseTile = showcaseTerrainAt(state.mapId, tx, ty);\n        const themedDungeonTiles = {',
    "draw showcase source",
)
engine = replace_once(
    engine,
    '        const tileArtId = tile === "lockedDoor"\n          ? tile\n          : (indexedTile?.code || themedTile || tile);',
    '        const tileArtId = tile === "lockedDoor"\n          ? tile\n          : (showcaseTile || indexedTile?.code || themedTile || tile);',
    "draw showcase tile art",
)
engine = replace_once(
    engine,
    '        if (tile === "wall") {\n          rect(x + 3, y + 3, 42, 10, "#34374d");\n          rect(x + 7, y + 17, 34, 9, "#202338");\n          rect(x + 3, y + 31, 42, 13, "#393c52");\n        }\n        ctx.restore();',
    '        if (tile === "wall") {\n          rect(x + 3, y + 3, 42, 10, "#34374d");\n          rect(x + 7, y + 17, 34, 9, "#202338");\n          rect(x + 3, y + 31, 42, 13, "#393c52");\n        }\n        if (isDirectionalLedge(tile)) {\n          rect(x, y + 25, 48, 23, "#3a3531");\n          rect(x, y + 22, 48, 5, "#9bb16f");\n          rect(x + 4, y + 31, 12, 3, "#5c5147");\n          rect(x + 22, y + 38, 18, 3, "#282725");\n          text(tile === TERRAIN.LEDGE_DOWN ? "▼" : "↕", x + 24, y + 17, 10, "center", "#e8e2b8");\n        }\n        if (tile === TERRAIN.STAIRS) {\n          rect(x + 5, y + 3, 38, 42, "#5c6261");\n          for (let stair = 0; stair < 5; stair += 1) {\n            rect(x + 7, y + 7 + stair * 8, 34, 4, stair % 2 ? "#858a82" : "#737a73");\n          }\n        }\n        if (tile === TERRAIN.PIT) {\n          rect(x + 3, y + 3, 42, 42, "#08090e");\n          rect(x + 8, y + 8, 32, 32, "#020308");\n          rect(x + 13, y + 13, 22, 22, "#000");\n          rect(x + 7, y + 5, 29, 3, "#292b36");\n        }\n        ctx.restore();',
    "draw traversal terrain",
)
engine = replace_once(
    engine,
    '    const bob = player.moving && (walkFrame === 1 || walkFrame === 3) ? -1 : 0;\n    const y = screenY(player.y) + bob;',
    '    const bob = player.moving && (walkFrame === 1 || walkFrame === 3) ? -1 : 0;\n    const traversalProgress = traversal\n      ? Math.min(1, traversal.elapsed / traversal.duration)\n      : 0;\n    const traversalOffset = traversal?.state === TRAVERSAL_STATE.HOP\n      ? -Math.sin(traversalProgress * Math.PI) * 28\n      : (traversal?.state === TRAVERSAL_STATE.FALL ? traversalProgress * 10 : 0);\n    const y = screenY(player.y) + bob + traversalOffset;',
    "player traversal animation",
)
ENGINE.write_text(engine)
