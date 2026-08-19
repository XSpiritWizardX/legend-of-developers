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
    'import { indexedRoomTileAt } from "./art/tileIndex";\n',
    'import { indexedRoomTileAt } from "./art/tileIndex";\nimport {\n  decayKnockback, hitStopFor, knockbackVector, movementScale, nearestFacingTarget, targetInFront,\n} from "./actionFeel";\n',
    "action feel import",
)
engine = replace_once(
    engine,
    '  let screenShake = 0;\n  let roomTitle = "";\n',
    '  let screenShake = 0;\n  let hitStop = 0;\n  let roomTitle = "";\n',
    "hit stop state",
)
engine = replace_once(
    engine,
    '      phase: Math.random() * 6, hit: 0, stunned: 0,\n',
    '      phase: Math.random() * 6, hit: 0, stunned: 0, knockbackX: 0, knockbackY: 0,\n',
    "enemy knockback state",
)
old_interact = '''  function interact() {\n    if (interactWorldObject()) return;\n    const currentMap = map();\n    if (state.mapId === "overworld") {\n      const dungeon = DUNGEONS.find((entry) => Math.hypot(player.x - entry.entrance.x, player.y - entry.entrance.y) < 88);\n      if (dungeon) {\n        changeMap(dungeon.id, MAPS[dungeon.id].spawn);\n        return;\n      }\n      const merchant = MERCHANTS.find((entry) => Math.hypot(player.x - (entry.x * TILE + TILE / 2), player.y - (entry.y * TILE + TILE / 2)) < 82);\n      if (merchant) {\n        merchantOpen = merchant;\n        merchantCursor = 0;\n        return;\n      }\n    } else if (state.mapId === "debugLab" && Math.hypot(player.x - currentMap.exit.x, player.y - currentMap.exit.y) < 82) {\n      changeMap("overworld", debugReturnPosition);\n      announce("RETURNED FROM DEBUG LAB");\n      return;\n    } else if (Math.hypot(player.x - currentMap.exit.x, player.y - currentMap.exit.y) < 82) {\n      const dungeon = DUNGEONS.find((entry) => entry.id === state.mapId);\n      changeMap("overworld", dungeonReturnPosition(dungeon));\n      return;\n    }\n\n    const chest = currentMap.chests.find((entry) => {\n      const [id, tx, ty] = entry;\n      if (state.openedChests[id]) return false;\n      if (id.endsWith("-reward") && enemiesByMap[state.mapId].some((enemy) => isPermanentEnemy(enemy.type))) return false;\n      return Math.hypot(player.x - (tx * TILE + TILE / 2), player.y - (ty * TILE + TILE / 2)) < 76;\n    });\n    if (chest) {\n      state.openedChests[chest[0]] = true;\n      reward(chest[3]);\n      save();\n      return;\n    }\n\n  }\n'''
new_interact = '''  function interact() {\n    if (interactWorldObject()) return;\n    const currentMap = map();\n    if (state.mapId === "overworld") {\n      const dungeon = nearestFacingTarget({\n        player,\n        targets: DUNGEONS.map((entry) => ({ ...entry, x: entry.entrance.x, y: entry.entrance.y })),\n        reach: 96,\n        halfAngle: 1.08,\n      });\n      if (dungeon) {\n        changeMap(dungeon.id, MAPS[dungeon.id].spawn);\n        return;\n      }\n      const merchant = nearestFacingTarget({\n        player,\n        targets: MERCHANTS.map((entry) => ({\n          ...entry,\n          x: entry.x * TILE + TILE / 2,\n          y: entry.y * TILE + TILE / 2,\n        })),\n        reach: 86,\n        halfAngle: 1.02,\n      });\n      if (merchant) {\n        merchantOpen = MERCHANTS.find((entry) => entry.id === merchant.id);\n        merchantCursor = 0;\n        return;\n      }\n    } else if (state.mapId === "debugLab" && targetInFront({ player, target: currentMap.exit, reach: 86, halfAngle: 1.08 })) {\n      changeMap("overworld", debugReturnPosition);\n      announce("RETURNED FROM DEBUG LAB");\n      return;\n    } else if (targetInFront({ player, target: currentMap.exit, reach: 86, halfAngle: 1.08 })) {\n      const dungeon = DUNGEONS.find((entry) => entry.id === state.mapId);\n      changeMap("overworld", dungeonReturnPosition(dungeon));\n      return;\n    }\n\n    const chestTarget = nearestFacingTarget({\n      player,\n      targets: currentMap.chests\n        .filter(([id]) => !state.openedChests[id])\n        .filter(([id]) => !(id.endsWith("-reward")\n          && enemiesByMap[state.mapId].some((enemy) => isPermanentEnemy(enemy.type))))\n        .map((entry) => ({\n          entry,\n          x: entry[1] * TILE + TILE / 2,\n          y: entry[2] * TILE + TILE / 2,\n        })),\n      reach: 80,\n      halfAngle: 1.04,\n    });\n    const chest = chestTarget?.entry;\n    if (chest) {\n      state.openedChests[chest[0]] = true;\n      reward(chest[3]);\n      save();\n      return;\n    }\n\n  }\n'''
engine = replace_once(engine, old_interact, new_interact, "facing interaction")
engine = replace_once(
    engine,
    '  function damageEnemy(enemy, amount) {\n    if (enemy.hit > 0) return;\n    enemy.hp -= amount;\n    enemy.hit = 0.22;\n    screenShake = Math.max(screenShake, isPermanentEnemy(enemy.type) ? 9 : 4);\n',
    '  function damageEnemy(enemy, amount) {\n    if (enemy.hit > 0) return;\n    const boss = isPermanentEnemy(enemy.type);\n    enemy.hp -= amount;\n    enemy.hit = 0.22;\n    const knockback = knockbackVector(player, enemy, boss ? 135 : 225);\n    enemy.knockbackX = knockback.x;\n    enemy.knockbackY = knockback.y;\n    hitStop = Math.max(hitStop, hitStopFor({ damage: amount, boss }));\n    screenShake = Math.max(screenShake, boss ? 9 : 4);\n',
    "enemy hit feedback",
)
engine = replace_once(
    engine,
    '      const isBoss = isPermanentEnemy(enemy.type);\n      spawnParticles(enemy.x, enemy.y, isBoss ? "#f02ea5" : "#d9fff8", isBoss ? 36 : 18, 230);\n      screenShake = Math.max(screenShake, isBoss ? 18 : 7);\n      if (isBoss) state.killed[enemy.id] = true;\n      player.coins += isBoss ? 50 + (map().number || 0) * 5 : 2;\n      if (isBoss) {\n',
    '      spawnParticles(enemy.x, enemy.y, boss ? "#f02ea5" : "#d9fff8", boss ? 36 : 18, 230);\n      screenShake = Math.max(screenShake, boss ? 18 : 7);\n      if (boss) state.killed[enemy.id] = true;\n      player.coins += boss ? 50 + (map().number || 0) * 5 : 2;\n      if (boss) {\n',
    "reuse boss flag",
)
engine = replace_once(
    engine,
    '    if (!running || paused || mapOpen || inventoryOpen || merchantOpen) return;\n    if (screenTransition) {\n',
    '    if (!running || paused || mapOpen || inventoryOpen || merchantOpen) return;\n    if (hitStop > 0) {\n      hitStop = Math.max(0, hitStop - dt);\n      return;\n    }\n    if (screenTransition) {\n',
    "apply hit stop",
)
engine = replace_once(
    engine,
    '      const moveSpeed = player.speed * (carriedObject ? 0.82 : 1);\n',
    '      const moveSpeed = player.speed * movementScale({\n        carrying: Boolean(carriedObject),\n        attacking: player.attackTime > 0,\n        charging: player.swordCharging,\n      });\n',
    "movement commitment",
)
old_enemy_motion = '''      enemy.phase += dt;\n      const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y);\n      if (!enemy.stunned && distance < 310 && distance > 0) {\n        const speed = enemy.type === "bat" ? 100 : isPermanentEnemy(enemy.type) ? 80 : 58;\n        const nx = enemy.x + (player.x - enemy.x) / distance * speed * dt;\n        const ny = enemy.y + (player.y - enemy.y) / distance * speed * dt;\n        if (enemyCanMove(enemy, nx, enemy.y)) enemy.x = nx;\n        if (enemyCanMove(enemy, enemy.x, ny)) enemy.y = ny;\n      }\n'''
new_enemy_motion = '''      enemy.phase += dt;\n      const knockbackSpeed = Math.hypot(enemy.knockbackX || 0, enemy.knockbackY || 0);\n      if (knockbackSpeed > 4) {\n        const knockX = enemy.x + enemy.knockbackX * dt;\n        const knockY = enemy.y + enemy.knockbackY * dt;\n        if (enemyCanMove(enemy, knockX, enemy.y)) enemy.x = knockX;\n        if (enemyCanMove(enemy, enemy.x, knockY)) enemy.y = knockY;\n        const decayed = decayKnockback(\n          { x: enemy.knockbackX, y: enemy.knockbackY },\n          dt,\n        );\n        enemy.knockbackX = decayed.x;\n        enemy.knockbackY = decayed.y;\n      }\n      const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y);\n      if (!enemy.stunned && knockbackSpeed < 18 && distance < 310 && distance > 0) {\n        const speed = enemy.type === "bat" ? 100 : isPermanentEnemy(enemy.type) ? 80 : 58;\n        const nx = enemy.x + (player.x - enemy.x) / distance * speed * dt;\n        const ny = enemy.y + (player.y - enemy.y) / distance * speed * dt;\n        if (enemyCanMove(enemy, nx, enemy.y)) enemy.x = nx;\n        if (enemyCanMove(enemy, enemy.x, ny)) enemy.y = ny;\n      }\n'''
engine = replace_once(engine, old_enemy_motion, new_enemy_motion, "enemy knockback movement")
engine = replace_once(
    engine,
    '        player.hp -= incomingDamage;\n        player.invincible = player.inventory.devJacket ? 1.65 : 1.1;\n        screenShake = boss ? 14 : 8;\n',
    '        player.hp -= incomingDamage;\n        player.invincible = player.inventory.devJacket ? 1.65 : 1.1;\n        const playerKnockback = knockbackVector(enemy, player, boss ? 245 : 185);\n        const hurtX = player.x + playerKnockback.x * 0.085;\n        const hurtY = player.y + playerKnockback.y * 0.085;\n        if (canMove(hurtX, player.y, Math.sign(playerKnockback.x), 0)) player.x = hurtX;\n        if (canMove(player.x, hurtY, 0, Math.sign(playerKnockback.y))) player.y = hurtY;\n        hitStop = Math.max(hitStop, 0.04);\n        screenShake = boss ? 14 : 8;\n',
    "player hurt knockback",
)
ENGINE.write_text(engine)
