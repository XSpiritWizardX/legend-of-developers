from pathlib import Path

ENGINE = Path("react-vite/src/components/Game/engine.js")
text = ENGINE.read_text()


def replace_once(old: str, new: str, label: str) -> None:
    global text
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly one anchor, found {count}")
    text = text.replace(old, new, 1)


replace_once(
    'import { contextActionLabel, contextActionText } from "./contextAction";\nimport { enemyMotion } from "./enemyBehaviors";',
    'import { contextActionLabel, contextActionText } from "./contextAction";\n'
    'import {\n'
    '  advanceEnemyProjectile, enemyProjectileExpired, enemyProjectileHitsPlayer,\n'
    '  rootboundBossVolley,\n'
    '} from "./enemyAttacks";\n'
    'import { enemyMotion } from "./enemyBehaviors";\n'
    'import { GAME_SFX, playGameSfx, unlockGameAudio } from "./gameAudio";\n'
    'import {\n'
    '  ROOTBOUND_FLAG, nextRootboundStoryBeat, resolveRootboundAction,\n'
    '  rootboundBossAttackCooldown, rootboundBossPhase, rootboundBossSpeedScale,\n'
    '  rootboundContextAction, rootboundGateBlocks,\n'
    '} from "./rootboundTempleContent";',
    "imports",
)

replace_once(
    '  let weaponEffects = [];\n  let merchantOpen = null;',
    '  let weaponEffects = [];\n  let enemyProjectiles = [];\n  let previousSwimming = false;\n  let merchantOpen = null;',
    "runtime state",
)

replace_once(
    '  function createEnemy(mapId, [id, type, tx, ty]) {\n'
    '    const spawnPoint = findOpenSpawn(mapId, tx, ty, type);\n'
    '    return {\n'
    '      id, type, x: spawnPoint.x, y: spawnPoint.y,\n'
    '      homeX: spawnPoint.x, homeY: spawnPoint.y,\n'
    '      hp: isPermanentEnemy(type)\n'
    '        ? 24 + (MAPS[mapId].number || 0) * 4\n'
    '        : (type === "guard" ? 6 : 4),\n'
    '      phase: Math.random() * 6, hit: 0, stunned: 0, knockbackX: 0, knockbackY: 0,\n'
    '    };\n'
    '  }',
    '  function createEnemy(mapId, [id, type, tx, ty]) {\n'
    '    const spawnPoint = findOpenSpawn(mapId, tx, ty, type);\n'
    '    const maxHp = isPermanentEnemy(type)\n'
    '      ? 24 + (MAPS[mapId].number || 0) * 4\n'
    '      : (type === "guard" ? 6 : 4);\n'
    '    return {\n'
    '      id, type, x: spawnPoint.x, y: spawnPoint.y,\n'
    '      homeX: spawnPoint.x, homeY: spawnPoint.y,\n'
    '      hp: maxHp, maxHp,\n'
    '      phase: Math.random() * 6, hit: 0, stunned: 0, knockbackX: 0, knockbackY: 0,\n'
    '      attackCooldown: 0.9 + Math.random() * 0.7, rootboundPhase: 1,\n'
    '    };\n'
    '  }',
    "enemy max hp and attack state",
)

replace_once(
    '  function solidAt(x, y) {\n'
    '    const tileX = Math.floor(x / TILE);\n'
    '    const tileY = Math.floor(y / TILE);\n'
    '    if (roomAssetSolidAt(state.mapId, x, y)) return true;',
    '  function solidAt(x, y) {\n'
    '    const tileX = Math.floor(x / TILE);\n'
    '    const tileY = Math.floor(y / TILE);\n'
    '    if (rootboundGateBlocks({\n'
    '      mapId: state.mapId, x, y, flags: state.flags, tileSize: TILE,\n'
    '    })) return true;\n'
    '    if (roomAssetSolidAt(state.mapId, x, y)) return true;',
    "Heart Gate collision",
)

replace_once(
    '    cssPulses = [];\n    weaponEffects = [];\n    const runtime = currentRoomRuntime(camera);',
    '    cssPulses = [];\n    weaponEffects = [];\n    enemyProjectiles = [];\n    previousSwimming = false;\n    const runtime = currentRoomRuntime(camera);',
    "map projectile reset",
)

replace_once(
    '    announce(MAPS[mapId].name.toUpperCase(), 2.6);\n    save();',
    '    announce(MAPS[mapId].name.toUpperCase(), 2.6);\n    playGameSfx(GAME_SFX.ROOM);\n    save();',
    "map audio",
)

replace_once(
    '  function reward(type) {\n    if (type === "htmlSword") {',
    '  function reward(type) {\n    playGameSfx(GAME_SFX.PICKUP);\n    if (type === "htmlSword") {',
    "reward audio",
)

replace_once(
    '    announce(`THREW ${object.kind.toUpperCase()}`, 1.2);\n    save();',
    '    announce(`THREW ${object.kind.toUpperCase()}`, 1.2);\n    playGameSfx(GAME_SFX.THROW);\n    save();',
    "throw audio",
)

replace_once(
    '  function currentContextAction() {\n'
    '    if (carriedObject) return contextActionLabel({ carried: true });\n'
    '    const direction = interactionDirection();',
    '  function interactRootboundContent() {\n'
    '    const action = rootboundContextAction({\n'
    '      mapId: state.mapId, player, flags: state.flags, tileSize: TILE,\n'
    '    });\n'
    '    if (!action) return false;\n'
    '    const result = resolveRootboundAction(action.action, state.flags);\n'
    '    if (result.patch) Object.assign(state.flags, result.patch);\n'
    '    if (result.coins) player.coins += result.coins;\n'
    '    if (result.reward) reward(result.reward);\n'
    '    if (result.message) announce(result.message, result.event === "secret" ? 4.8 : 3.8);\n'
    '    if (result.changed) {\n'
    '      spawnParticles(\n'
    '        player.x, player.y - 8,\n'
    '        result.event === "gate" ? "#d4b76b" : "#8fa39a",\n'
    '        result.event === "gate" ? 28 : 18,\n'
    '        result.event === "gate" ? 190 : 135,\n'
    '      );\n'
    '      screenShake = Math.max(screenShake, result.event === "gate" ? 10 : 5);\n'
    '      playGameSfx(result.event === "secret" ? GAME_SFX.CHEST : GAME_SFX.ROOM);\n'
    '      save();\n'
    '    }\n'
    '    return true;\n'
    '  }\n\n'
    '  function currentContextAction() {\n'
    '    if (carriedObject) return contextActionLabel({ carried: true });\n'
    '    const rootboundAction = rootboundContextAction({\n'
    '      mapId: state.mapId, player, flags: state.flags, tileSize: TILE,\n'
    '    });\n'
    '    if (rootboundAction) return rootboundAction;\n'
    '    const direction = interactionDirection();',
    "Rootbound interactions and prompt",
)

replace_once(
    '  function interact() {\n    if (interactWorldObject()) return;',
    '  function interact() {\n    if (interactRootboundContent()) return;\n    if (interactWorldObject()) return;',
    "Rootbound interaction dispatch",
)

replace_once(
    '    if (chest) {\n'
    '      state.openedChests[chest[0]] = true;\n'
    '      reward(chest[3]);',
    '    if (chest) {\n'
    '      state.openedChests[chest[0]] = true;\n'
    '      playGameSfx(GAME_SFX.CHEST);\n'
    '      reward(chest[3]);',
    "chest audio",
)

replace_once(
    '  function swordStrike() {\n    const dir = directionVector();',
    '  function swordStrike() {\n    playGameSfx(GAME_SFX.SWORD);\n    const dir = directionVector();',
    "sword audio",
)

replace_once(
    '  function chargedSwordStrike() {\n    const swordLevel = player.equipmentLevels.sword;',
    '  function chargedSwordStrike() {\n    playGameSfx(GAME_SFX.SWORD);\n    const swordLevel = player.equipmentLevels.sword;',
    "spin audio",
)

replace_once(
    '  function damageEnemy(enemy, amount) {\n'
    '    if (enemy.hit > 0) return;\n'
    '    const boss = isPermanentEnemy(enemy.type);',
    '  function damageEnemy(enemy, amount) {\n'
    '    if (enemy.hit > 0) return;\n'
    '    playGameSfx(GAME_SFX.HIT);\n'
    '    const boss = isPermanentEnemy(enemy.type);',
    "hit audio",
)

replace_once(
    '      traversal = {\n'
    '        state: TRAVERSAL_STATE.FALL,\n'
    '        elapsed: 0,\n'
    '        duration: 0.48,\n'
    '        recover: recoveryPoint(safeGroundHistory, map().spawn),\n'
    '      };\n'
    '      player.moving = false;',
    '      traversal = {\n'
    '        state: TRAVERSAL_STATE.FALL,\n'
    '        elapsed: 0,\n'
    '        duration: 0.48,\n'
    '        recover: recoveryPoint(safeGroundHistory, map().spawn),\n'
    '      };\n'
    '      playGameSfx(GAME_SFX.FALL);\n'
    '      player.moving = false;',
    "fall audio",
)

replace_once(
    '    traversal = {\n'
    '      state: TRAVERSAL_STATE.HOP,\n'
    '      elapsed: 0,\n'
    '      duration: 0.30,\n'
    '      from: { x: player.x, y: player.y },\n'
    '      to: landing,\n'
    '    };',
    '    traversal = {\n'
    '      state: TRAVERSAL_STATE.HOP,\n'
    '      elapsed: 0,\n'
    '      duration: 0.30,\n'
    '      from: { x: player.x, y: player.y },\n'
    '      to: landing,\n'
    '    };\n'
    '    playGameSfx(GAME_SFX.HOP);',
    "hop audio",
)

replace_once(
    '  function updateProjectiles(dt) {\n    updateThrownWorldObject(dt);',
    '  function updateEnemyProjectiles(dt) {\n'
    '    const nextProjectiles = [];\n'
    '    for (const projectileState of enemyProjectiles) {\n'
    '      const next = advanceEnemyProjectile(projectileState, dt);\n'
    '      if (enemyProjectileExpired(next)) continue;\n'
    '      if (next.delay <= 0 && solidAt(next.x, next.y)) continue;\n'
    '      if (enemyProjectileHitsPlayer(next, player) && player.invincible <= 0) {\n'
    '        player.hp -= next.damage || 1;\n'
    '        player.invincible = player.inventory.devJacket ? 1.65 : 1.1;\n'
    '        screenShake = Math.max(screenShake, 8);\n'
    '        spawnParticles(player.x, player.y, "#b96f5d", 12, 145);\n'
    '        playGameSfx(GAME_SFX.HIT);\n'
    '        if (player.hp <= 0) {\n'
    '          player.hp = player.maxHp;\n'
    '          changeMap("overworld", MAPS.overworld.spawn);\n'
    '          announce("YOU HAVE FALLEN · RETURNING TO WILLOWBROOK");\n'
    '          return;\n'
    '        }\n'
    '        continue;\n'
    '      }\n'
    '      nextProjectiles.push(next);\n'
    '    }\n'
    '    enemyProjectiles = nextProjectiles;\n'
    '  }\n\n'
    '  function updateProjectiles(dt) {\n'
    '    updateThrownWorldObject(dt);\n'
    '    updateEnemyProjectiles(dt);',
    "enemy projectile update",
)

replace_once(
    '    if (state.mapId !== "overworld" && tileAt(state.mapId, tx, ty, state.flags) === "switch" && !state.flags[`switch_${state.mapId}`]) {\n'
    '      state.flags[`switch_${state.mapId}`] = true;\n'
    '      announce("MAGIC BARRIER DISABLED");\n'
    '      save();\n'
    '    }\n\n'
    '    const enemies = enemiesByMap[state.mapId];',
    '    if (state.mapId !== "overworld" && tileAt(state.mapId, tx, ty, state.flags) === "switch" && !state.flags[`switch_${state.mapId}`]) {\n'
    '      state.flags[`switch_${state.mapId}`] = true;\n'
    '      announce("MAGIC BARRIER DISABLED");\n'
    '      playGameSfx(GAME_SFX.ROOM);\n'
    '      save();\n'
    '    }\n\n'
    '    const swimmingNow = playerIsSwimming();\n'
    '    if (swimmingNow !== previousSwimming) {\n'
    '      playGameSfx(GAME_SFX.SPLASH);\n'
    '      previousSwimming = swimmingNow;\n'
    '    }\n'
    '    const storyBeat = nextRootboundStoryBeat({\n'
    '      mapId: state.mapId, player, flags: state.flags, tileSize: TILE,\n'
    '    });\n'
    '    if (storyBeat) {\n'
    '      state.flags[storyBeat.flag] = true;\n'
    '      announce(storyBeat.message, 4.6);\n'
    '      playGameSfx(GAME_SFX.ROOM);\n'
    '      save();\n'
    '    }\n\n'
    '    const enemies = enemiesByMap[state.mapId];',
    "story beats and swim audio",
)

replace_once(
    '      enemy.hit = Math.max(0, enemy.hit - dt);\n'
    '      enemy.stunned = Math.max(0, enemy.stunned - dt);\n'
    '      enemy.phase += dt;\n'
    '      const knockbackSpeed = Math.hypot(enemy.knockbackX || 0, enemy.knockbackY || 0);',
    '      enemy.hit = Math.max(0, enemy.hit - dt);\n'
    '      enemy.stunned = Math.max(0, enemy.stunned - dt);\n'
    '      enemy.attackCooldown = Math.max(0, (enemy.attackCooldown || 0) - dt);\n'
    '      enemy.phase += dt;\n'
    '      const bossPhase = rootboundBossPhase({\n'
    '        type: enemy.type, hp: enemy.hp, maxHp: enemy.maxHp || enemy.hp,\n'
    '      });\n'
    '      if (enemy.type === "bossCacheColossus" && bossPhase !== enemy.rootboundPhase) {\n'
    '        enemy.rootboundPhase = bossPhase;\n'
    '        if (bossPhase >= 2) {\n'
    '          announce("CACHE COLOSSUS · HEARTROOT PHASE AWAKENED", 4.5);\n'
    '          screenShake = Math.max(screenShake, 15);\n'
    '          spawnParticles(enemy.x, enemy.y, "#d4b76b", 34, 220);\n'
    '          playGameSfx(GAME_SFX.HIT);\n'
    '        }\n'
    '      }\n'
    '      const knockbackSpeed = Math.hypot(enemy.knockbackX || 0, enemy.knockbackY || 0);',
    "boss phase state",
)

replace_once(
    '        const motion = enemyMotion({ enemy, player, distance, baseSpeed });\n'
    '        enemy.aiState = motion.state;\n'
    '        const nx = enemy.x + motion.vector.x * motion.speed * dt;\n'
    '        const ny = enemy.y + motion.vector.y * motion.speed * dt;',
    '        const motion = enemyMotion({ enemy, player, distance, baseSpeed });\n'
    '        enemy.aiState = motion.state;\n'
    '        const bossSpeedScale = enemy.type === "bossCacheColossus"\n'
    '          ? rootboundBossSpeedScale(bossPhase)\n'
    '          : 1;\n'
    '        const nx = enemy.x + motion.vector.x * motion.speed * bossSpeedScale * dt;\n'
    '        const ny = enemy.y + motion.vector.y * motion.speed * bossSpeedScale * dt;',
    "boss phase movement",
)

replace_once(
    '      } else if (enemy.stunned) {\n'
    '        enemy.aiState = "stunned";\n'
    '      }\n'
    '      const boss = isPermanentEnemy(enemy.type);',
    '      } else if (enemy.stunned) {\n'
    '        enemy.aiState = "stunned";\n'
    '      }\n'
    '      if (\n'
    '        enemy.type === "bossCacheColossus" && !enemy.stunned\n'
    '        && distance < 430 && enemy.attackCooldown <= 0\n'
    '      ) {\n'
    '        enemyProjectiles.push(...rootboundBossVolley({\n'
    '          boss: enemy, player, phase: bossPhase,\n'
    '        }));\n'
    '        enemy.attackCooldown = rootboundBossAttackCooldown(bossPhase);\n'
    '        playGameSfx(GAME_SFX.ROOM);\n'
    '      }\n'
    '      const boss = isPermanentEnemy(enemy.type);',
    "boss projectile trigger",
)

replace_once(
    '      screenTransition = {\n'
    '        fromX: camera.x,\n'
    '        fromY: camera.y,\n'
    '        toX,\n'
    '        toY,\n'
    '        elapsed: 0,\n'
    '        duration: 0.42,\n'
    '      };\n'
    '      save();',
    '      screenTransition = {\n'
    '        fromX: camera.x,\n'
    '        fromY: camera.y,\n'
    '        toX,\n'
    '        toY,\n'
    '        elapsed: 0,\n'
    '        duration: 0.42,\n'
    '      };\n'
    '      playGameSfx(GAME_SFX.ROOM);\n'
    '      save();',
    "room slide audio",
)

replace_once(
    '    const renderables = visibleRoomAssets(state.mapId, camera.x, camera.y, VIEW_W, VIEW_H)\n'
    '      .filter((asset) => (\n'
    '        asset.type !== "dungeonBarrier" || !state.flags[`switch_${state.mapId}`]\n'
    '      ))',
    '    const renderables = visibleRoomAssets(state.mapId, camera.x, camera.y, VIEW_W, VIEW_H)\n'
    '      .filter((asset) => {\n'
    '        if (asset.type !== "dungeonBarrier") return true;\n'
    '        if (state.mapId === "d01" && state.flags[ROOTBOUND_FLAG.GATE_OPEN]) return false;\n'
    '        return !state.flags[`switch_${state.mapId}`];\n'
    '      })',
    "Heart Gate visibility",
)

replace_once(
    '    ctx.fill();\n'
    '    if (["windup", "squash"].includes(enemy.aiState)) {',
    '    ctx.fill();\n'
    '    if (enemy.type === "bossCacheColossus" && enemy.rootboundPhase >= 2) {\n'
    '      const phasePulse = 42 + Math.sin(performance.now() / 120) * 5;\n'
    '      ctx.globalAlpha = 0.45;\n'
    '      ctx.strokeStyle = "#d4b76b";\n'
    '      ctx.lineWidth = 4;\n'
    '      ctx.beginPath();\n'
    '      ctx.arc(x, y + 4, phasePulse, 0, Math.PI * 2);\n'
    '      ctx.stroke();\n'
    '      ctx.globalAlpha = 1;\n'
    '    }\n'
    '    if (["windup", "squash"].includes(enemy.aiState)) {',
    "phase two boss aura",
)

replace_once(
    '      if (boss) {\n'
    '        const maxHp = 14 + (map().number || 0);\n'
    '        rect(x - 43, y - 59, 86, 7, "#080914dd");\n'
    '        rect(x - 41, y - 57, 82 * Math.max(0, enemy.hp / maxHp), 3, "#b96f5d");\n'
    '      }',
    '      if (boss) {\n'
    '        const maxHp = enemy.maxHp || (24 + (map().number || 0) * 4);\n'
    '        rect(x - 43, y - 59, 86, 7, "#080914dd");\n'
    '        rect(x - 41, y - 57, 82 * Math.max(0, enemy.hp / maxHp), 3, "#b96f5d");\n'
    '      }',
    "boss health bar",
)

replace_once(
    '  function drawWeaponEffects() {',
    '  function drawEnemyProjectiles() {\n'
    '    enemyProjectiles.forEach((projectileState) => {\n'
    '      const x = screenX(projectileState.x);\n'
    '      const y = screenY(projectileState.y);\n'
    '      if (projectileState.delay > 0) {\n'
    '        const pulse = 22 + Math.sin(performance.now() / 80) * 5;\n'
    '        ctx.globalAlpha = 0.55;\n'
    '        ctx.strokeStyle = "#d4b76b";\n'
    '        ctx.lineWidth = 3;\n'
    '        ctx.beginPath();\n'
    '        ctx.arc(x, y, pulse, 0, Math.PI * 2);\n'
    '        ctx.stroke();\n'
    '        ctx.globalAlpha = 1;\n'
    '        return;\n'
    '      }\n'
    '      const trailX = x - projectileState.vx * 0.045;\n'
    '      const trailY = y - projectileState.vy * 0.045;\n'
    '      ctx.strokeStyle = "#8fa39aaa";\n'
    '      ctx.lineWidth = 4;\n'
    '      ctx.lineCap = "round";\n'
    '      ctx.beginPath();\n'
    '      ctx.moveTo(trailX, trailY);\n'
    '      ctx.lineTo(x, y);\n'
    '      ctx.stroke();\n'
    '      ctx.fillStyle = "#d4b76b";\n'
    '      ctx.beginPath();\n'
    '      ctx.arc(x, y, projectileState.radius || 10, 0, Math.PI * 2);\n'
    '      ctx.fill();\n'
    '      ctx.fillStyle = "#f3e7bd";\n'
    '      ctx.beginPath();\n'
    '      ctx.arc(x - 2, y - 2, 3, 0, Math.PI * 2);\n'
    '      ctx.fill();\n'
    '    });\n'
    '  }\n\n'
    '  function drawWeaponEffects() {',
    "enemy projectile renderer",
)

replace_once(
    '    drawDepthSortedActors();\n    drawWeaponEffects();\n    drawParticles();',
    '    drawDepthSortedActors();\n    drawEnemyProjectiles();\n    drawWeaponEffects();\n    drawParticles();',
    "enemy projectile draw call",
)

replace_once(
    '  function keydown(event) {\n'
    '    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) event.preventDefault();',
    '  function keydown(event) {\n'
    '    unlockGameAudio();\n'
    '    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) event.preventDefault();',
    "audio unlock",
)

ENGINE.write_text(text)
print("Applied Rootbound Temple gameplay integration to engine.js")
