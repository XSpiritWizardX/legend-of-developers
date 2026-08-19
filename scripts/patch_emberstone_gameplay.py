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
    'import { contextActionLabel, contextActionText } from "./contextAction";\nimport {\n'
    '  advanceEnemyProjectile, enemyProjectileExpired, enemyProjectileHitsPlayer,',
    'import { contextActionLabel, contextActionText } from "./contextAction";\n'
    'import {\n'
    '  EMBERSTONE_FLAG, emberstoneContextAction, emberstoneGateBlocks,\n'
    '  emberstoneWindDiscTarget, nextEmberstoneStoryBeat, resolveEmberstoneAction,\n'
    '  resolveEmberstoneWindDiscHit,\n'
    '} from "./emberstoneContent";\n'
    'import {\n'
    '  advanceEnemyProjectile, enemyProjectileExpired, enemyProjectileHitsPlayer,',
    "Emberstone imports",
)

replace_once(
    '    if (rootboundGateBlocks({\n'
    '      mapId: state.mapId, x, y, flags: state.flags, tileSize: TILE,\n'
    '    })) return true;\n'
    '    if (roomAssetSolidAt(state.mapId, x, y)) return true;',
    '    if (rootboundGateBlocks({\n'
    '      mapId: state.mapId, x, y, flags: state.flags, tileSize: TILE,\n'
    '    })) return true;\n'
    '    if (emberstoneGateBlocks({\n'
    '      mapId: state.mapId, x, y, flags: state.flags, tileSize: TILE,\n'
    '    })) return true;\n'
    '    if (roomAssetSolidAt(state.mapId, x, y)) return true;',
    "Forge Gate collision",
)

replace_once(
    '  function interactRootboundContent() {',
    '  function interactEmberstoneContent() {\n'
    '    const action = emberstoneContextAction({\n'
    '      mapId: state.mapId, player, flags: state.flags, tileSize: TILE,\n'
    '    });\n'
    '    if (!action) return false;\n'
    '    const result = resolveEmberstoneAction(action.action, state.flags);\n'
    '    if (result.patch) Object.assign(state.flags, result.patch);\n'
    '    if (result.coins) player.coins += result.coins;\n'
    '    if (result.reward) reward(result.reward);\n'
    '    if (result.message) announce(result.message, result.event === "secret" ? 4.5 : 3.7);\n'
    '    if (result.changed) {\n'
    '      spawnParticles(\n'
    '        player.x, player.y - 8,\n'
    '        result.event === "gate" ? "#d4b76b" : "#b96f5d",\n'
    '        result.event === "gate" ? 30 : 18,\n'
    '        result.event === "gate" ? 205 : 145,\n'
    '      );\n'
    '      screenShake = Math.max(screenShake, result.event === "gate" ? 11 : 5);\n'
    '      playGameSfx(result.event === "secret" ? GAME_SFX.CHEST : GAME_SFX.ROOM);\n'
    '      save();\n'
    '    }\n'
    '    return true;\n'
    '  }\n\n'
    '  function interactRootboundContent() {',
    "Emberstone interaction handler",
)

replace_once(
    '  function currentContextAction() {\n'
    '    if (carriedObject) return contextActionLabel({ carried: true });\n'
    '    const rootboundAction = rootboundContextAction({',
    '  function currentContextAction() {\n'
    '    if (carriedObject) return contextActionLabel({ carried: true });\n'
    '    const emberstoneAction = emberstoneContextAction({\n'
    '      mapId: state.mapId, player, flags: state.flags, tileSize: TILE,\n'
    '    });\n'
    '    if (emberstoneAction) return emberstoneAction;\n'
    '    const rootboundAction = rootboundContextAction({',
    "Emberstone context prompt",
)

replace_once(
    '  function interact() {\n    if (interactRootboundContent()) return;',
    '  function interact() {\n'
    '    if (interactEmberstoneContent()) return;\n'
    '    if (interactRootboundContent()) return;',
    "Emberstone interaction dispatch",
)

replace_once(
    '        boomerang.x += boomerang.vx * dt;\n'
    '        boomerang.y += boomerang.vy * dt;\n'
    '        boomerang.distance += 380 * dt;\n'
    '        const callbackTile = tileAt(',
    '        boomerang.x += boomerang.vx * dt;\n'
    '        boomerang.y += boomerang.vy * dt;\n'
    '        boomerang.distance += 380 * dt;\n'
    '        const emberstoneTarget = emberstoneWindDiscTarget({\n'
    '          mapId: state.mapId, x: boomerang.x, y: boomerang.y,\n'
    '          flags: state.flags, tileSize: TILE,\n'
    '        });\n'
    '        if (emberstoneTarget) {\n'
    '          const result = resolveEmberstoneWindDiscHit(emberstoneTarget, state.flags);\n'
    '          if (result.patch) Object.assign(state.flags, result.patch);\n'
    '          if (result.message) announce(result.message, 4);\n'
    '          if (result.changed) {\n'
    '            const targetX = emberstoneTarget.tx * TILE + TILE / 2;\n'
    '            const targetY = emberstoneTarget.ty * TILE + TILE / 2;\n'
    '            spawnParticles(targetX, targetY, "#d4b76b", 22, 170);\n'
    '            screenShake = Math.max(screenShake, 6);\n'
    '            playGameSfx(GAME_SFX.ROOM);\n'
    '            save();\n'
    '          }\n'
    '          boomerang.returning = true;\n'
    '        }\n'
    '        const callbackTile = tileAt(',
    "Wind Disc regulator hit",
)

replace_once(
    '        if (callbackTile === "callbackNode") {',
    '        if (!boomerang.returning && callbackTile === "callbackNode") {',
    "callback node guard one",
)

replace_once(
    '        } else if (callbackTile === "callbackNode2") {',
    '        } else if (!boomerang.returning && callbackTile === "callbackNode2") {',
    "callback node guard two",
)

replace_once(
    '        } else if (boomerang.distance > 230 || solidAt(boomerang.x, boomerang.y)) {',
    '        } else if (!boomerang.returning && (boomerang.distance > 230 || solidAt(boomerang.x, boomerang.y))) {',
    "boomerang return guard",
)

replace_once(
    '    if (storyBeat) {\n'
    '      state.flags[storyBeat.flag] = true;\n'
    '      announce(storyBeat.message, 4.6);\n'
    '      playGameSfx(GAME_SFX.ROOM);\n'
    '      save();\n'
    '    }\n\n'
    '    const enemies = enemiesByMap[state.mapId];',
    '    if (storyBeat) {\n'
    '      state.flags[storyBeat.flag] = true;\n'
    '      announce(storyBeat.message, 4.6);\n'
    '      playGameSfx(GAME_SFX.ROOM);\n'
    '      save();\n'
    '    }\n'
    '    const emberstoneStoryBeat = nextEmberstoneStoryBeat({\n'
    '      mapId: state.mapId, player, flags: state.flags, tileSize: TILE,\n'
    '    });\n'
    '    if (emberstoneStoryBeat) {\n'
    '      state.flags[emberstoneStoryBeat.flag] = true;\n'
    '      announce(emberstoneStoryBeat.message, 4.6);\n'
    '      playGameSfx(GAME_SFX.ROOM);\n'
    '      save();\n'
    '    }\n\n'
    '    const enemies = enemiesByMap[state.mapId];',
    "Emberstone story beats",
)

replace_once(
    '        if (asset.type !== "dungeonBarrier") return true;\n'
    '        if (state.mapId === "d01" && state.flags[ROOTBOUND_FLAG.GATE_OPEN]) return false;\n'
    '        return !state.flags[`switch_${state.mapId}`];',
    '        if (asset.type !== "dungeonBarrier") return true;\n'
    '        if (state.mapId === "d01" && state.flags[ROOTBOUND_FLAG.GATE_OPEN]) return false;\n'
    '        if (state.mapId === "d02" && state.flags[EMBERSTONE_FLAG.GATE_OPEN]) return false;\n'
    '        return !state.flags[`switch_${state.mapId}`];',
    "Forge Gate visibility",
)

ENGINE.write_text(text)
print("Applied Emberstone Wind Disc gameplay integration to engine.js")
