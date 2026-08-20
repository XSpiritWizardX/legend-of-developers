from pathlib import Path

ENGINE = Path("react-vite/src/components/Game/engine.js")
text = ENGINE.read_text()


def replace_once(anchor, replacement, label):
    global text
    if text.count(anchor) != 1:
        raise SystemExit(f"{label} anchor changed; refusing production SFX patch")
    text = text.replace(anchor, replacement, 1)


def replace_count(anchor, replacement, expected, label):
    global text
    if text.count(anchor) != expected:
        raise SystemExit(
            f"{label} expected {expected} anchors, found {text.count(anchor)}; refusing production SFX patch"
        )
    text = text.replace(anchor, replacement)


replace_once(
    '''  const saved = initialSave || {};
  const compatibleLayout = saved.version === 3;
  const state = {
    mapId: compatibleLayout ? (saved.mapId || "overworld") : "overworld",
''',
    '''  const saved = initialSave || {};
  const compatibleLayout = saved.version === 3;
  const requestedMapId = compatibleLayout ? saved.mapId : null;
  const safeMapId = requestedMapId && MAPS[requestedMapId] ? requestedMapId : "overworld";
  const state = {
    mapId: safeMapId,
''',
    "saved map validation",
)

replace_once(
    '''  function reward(type) {
    playGameSfx(GAME_SFX.PICKUP);
''',
    '''  function reward(type) {
    playGameSfx(type === "heart"
      ? GAME_SFX.HEART
      : (type === "key" ? GAME_SFX.KEY : GAME_SFX.PICKUP));
''',
    "reward cue",
)

replace_count(
    '      playGameSfx(result.event === "secret" ? GAME_SFX.CHEST : GAME_SFX.ROOM);\n',
    '      playGameSfx(result.event === "secret" ? GAME_SFX.SECRET : GAME_SFX.SWITCH);\n',
    2,
    "authored puzzle cue",
)

replace_once(
    '''    if (player.magic < cost) {
      announce("NOT ENOUGH MAGIC · WAIT FOR IT TO REFILL");
      return false;
''',
    '''    if (player.magic < cost) {
      announce("NOT ENOUGH MAGIC · WAIT FOR IT TO REFILL");
      playGameSfx(GAME_SFX.ERROR);
      return false;
''',
    "insufficient magic cue",
)

replace_once(
    '''  function activateHookshot() {
    if (!player.inventory.hookshot) return announce("YOU HAVE NOT FOUND THE HOOKSHOT");
    const dir = directionVector();
''',
    '''  function activateHookshot() {
    if (!player.inventory.hookshot) return announce("YOU HAVE NOT FOUND THE HOOKSHOT");
    playGameSfx(GAME_SFX.GRAPPLE);
    const dir = directionVector();
''',
    "grapple cue",
)

replace_once(
    '''  function activateRod(kind) {
    const key = kind === "fire" ? "fireRod" : "iceRod";
    if (!player.inventory[key]) return announce(`YOU HAVE NOT FOUND THE ${kind.toUpperCase()} ROD`);
    enemiesByMap[state.mapId].forEach((enemy) => {
''',
    '''  function activateRod(kind) {
    const key = kind === "fire" ? "fireRod" : "iceRod";
    if (!player.inventory[key]) return announce(`YOU HAVE NOT FOUND THE ${kind.toUpperCase()} ROD`);
    playGameSfx(kind === "fire" ? GAME_SFX.FIRE : GAME_SFX.ICE);
    enemiesByMap[state.mapId].forEach((enemy) => {
''',
    "elemental rod cue",
)

replace_once(
    '''  function dash() {
    if (player.dashCooldown > 0) return;
    const dir = directionVector();
''',
    '''  function dash() {
    if (player.dashCooldown > 0) return;
    playGameSfx(GAME_SFX.DASH);
    const dir = directionVector();
''',
    "dash cue",
)

replace_once(
    '''    if (enemy.hp <= 0) {
      spawnParticles(enemy.x, enemy.y, boss ? "#b96f5d" : "#d9fff8", boss ? 36 : 18, 230);
''',
    '''    if (enemy.hp <= 0) {
      playGameSfx(boss ? GAME_SFX.BOSS_DEFEAT : GAME_SFX.ENEMY_DEFEAT);
      spawnParticles(enemy.x, enemy.y, boss ? "#b96f5d" : "#d9fff8", boss ? 36 : 18, 230);
''',
    "enemy defeat cue",
)

replace_once(
    '''        spawnParticles(player.x, player.y, "#b96f5d", 12, 145);
        playGameSfx(GAME_SFX.HIT);
        if (player.hp <= 0) {
''',
    '''        spawnParticles(player.x, player.y, "#b96f5d", 12, 145);
        playGameSfx(GAME_SFX.PLAYER_HURT);
        if (player.hp <= 0) {
''',
    "projectile hurt cue",
)

replace_once(
    '''      if (bomb.timer <= 0 && !bomb.exploded) {
        bomb.exploded = true;
        enemiesByMap[state.mapId].forEach((enemy) => {
''',
    '''      if (bomb.timer <= 0 && !bomb.exploded) {
        bomb.exploded = true;
        playGameSfx(GAME_SFX.BOMB);
        enemiesByMap[state.mapId].forEach((enemy) => {
''',
    "bomb explosion cue",
)

replace_once(
    '''          if (foundSecret) {
            state.flags[`secret_${state.mapId}`] = true;
            announce("HIDDEN PASSAGE OPENED");
            save();
''',
    '''          if (foundSecret) {
            state.flags[`secret_${state.mapId}`] = true;
            announce("HIDDEN PASSAGE OPENED");
            playGameSfx(GAME_SFX.SECRET);
            save();
''',
    "bomb secret cue",
)

replace_once(
    '''      state.flags[doorFlag] = true;
      announce("SMALL KEY USED");
      save();
''',
    '''      state.flags[doorFlag] = true;
      announce("SMALL KEY USED");
      playGameSfx(GAME_SFX.DOOR);
      save();
''',
    "door cue",
)

replace_once(
    '''      state.flags[`switch_${state.mapId}`] = true;
      announce("MAGIC BARRIER DISABLED");
      playGameSfx(GAME_SFX.ROOM);
      save();
''',
    '''      state.flags[`switch_${state.mapId}`] = true;
      announce("MAGIC BARRIER DISABLED");
      playGameSfx(GAME_SFX.SWITCH);
      save();
''',
    "dungeon switch cue",
)

replace_once(
    '''          spawnParticles(enemy.x, enemy.y, "#d4b76b", 34, 220);
          playGameSfx(GAME_SFX.HIT);
''',
    '''          spawnParticles(enemy.x, enemy.y, "#d4b76b", 34, 220);
          playGameSfx(GAME_SFX.BOSS_PHASE);
''',
    "boss phase cue",
)

replace_once(
    '''        enemy.attackCooldown = rootboundBossAttackCooldown(bossPhase);
        playGameSfx(GAME_SFX.ROOM);
''',
    '''        enemy.attackCooldown = rootboundBossAttackCooldown(bossPhase);
        playGameSfx(GAME_SFX.MAGIC);
''',
    "boss volley cue",
)

replace_once(
    '''        spawnParticles(player.x, player.y, "#ff6f7d", boss ? 18 : 10, 170);
        if (player.hp <= 0) {
''',
    '''        spawnParticles(player.x, player.y, "#ff6f7d", boss ? 18 : 10, 170);
        playGameSfx(GAME_SFX.PLAYER_HURT);
        if (player.hp <= 0) {
''',
    "contact hurt cue",
)

replace_once(
    '''    if (key === "h" && !keys.h && !event.repeat) {
      player.swordCharging = true;
      player.swordCharge = 0;
    }
''',
    '''    if (key === "h" && !keys.h && !event.repeat) {
      player.swordCharging = true;
      player.swordCharge = 0;
      playGameSfx(GAME_SFX.CHARGE);
    }
''',
    "sword charge cue",
)

replace_once(
    '''    if (player.coins < price) {
      announce("NOT ENOUGH GOLD");
      return;
''',
    '''    if (player.coins < price) {
      announce("NOT ENOUGH GOLD");
      playGameSfx(GAME_SFX.ERROR);
      return;
''',
    "merchant error cue",
)

ENGINE.write_text(text)
