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
    'import { GAME_SFX, playGameSfx, unlockGameAudio } from "./gameAudio";\nimport {',
    'import { GAME_SFX, playGameSfx, unlockGameAudio } from "./gameAudio";\n'
    'import { stopAdaptiveMusic, syncAdaptiveMusic } from "./gameMusic";\n'
    'import {',
    "music import",
)

replace_once(
    '  buildEnemies(state.mapId);\n\n  function snapshot() {',
    '  buildEnemies(state.mapId);\n\n'
    '  function syncMusic() {\n'
    '    const livingBoss = (enemiesByMap[state.mapId] || [])\n'
    '      .find((enemy) => isPermanentEnemy(enemy.type) && enemy.hp > 0);\n'
    '    syncAdaptiveMusic({\n'
    '      mapId: state.mapId,\n'
    '      mapTheme: map().theme,\n'
    '      roomTitle: roomRuntimeTitle(),\n'
    '      bossType: livingBoss?.type,\n'
    '      bossPhase: livingBoss?.rootboundPhase || 1,\n'
    '    });\n'
    '  }\n\n'
    '  function snapshot() {',
    "music sync helper",
)

replace_once(
    '    particles = particles.filter((particle) => particle.life > 0);\n'
    '    if (!running || paused || mapOpen || inventoryOpen || merchantOpen) return;\n'
    '    if (hitStop > 0) {',
    '    particles = particles.filter((particle) => particle.life > 0);\n'
    '    if (!running) return;\n'
    '    syncMusic();\n'
    '    if (paused || mapOpen || inventoryOpen || merchantOpen) return;\n'
    '    if (hitStop > 0) {',
    "music loop sync",
)

replace_once(
    '    destroy() {\n'
    '      cancelAnimationFrame(frame);\n'
    '      document.removeEventListener("keydown", keydown);',
    '    destroy() {\n'
    '      cancelAnimationFrame(frame);\n'
    '      stopAdaptiveMusic();\n'
    '      document.removeEventListener("keydown", keydown);',
    "music teardown",
)

ENGINE.write_text(text)
print("Applied adaptive music integration to engine.js")
