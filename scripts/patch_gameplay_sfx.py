from pathlib import Path

ENGINE = Path("react-vite/src/components/Game/engine.js")
text = ENGINE.read_text()

import_anchor = 'import { enemyMotion } from "./enemyBehaviors";\n'
import_replacement = import_anchor + '''import {
  GAME_SFX, playGameSfx, unlockGameAudio,
} from "./gameAudio";
'''
if text.count(import_anchor) != 1:
    raise SystemExit("enemyMotion import anchor changed; refusing audio patch")
text = text.replace(import_anchor, import_replacement, 1)

state_anchor = '  let lastSafeTile = null;\n'
state_replacement = state_anchor + '  let wasSwimming = false;\n'
if text.count(state_anchor) != 1:
    raise SystemExit("safe tile state anchor changed; refusing audio patch")
text = text.replace(state_anchor, state_replacement, 1)

change_map_anchor = '''  function changeMap(mapId, position) {
    if (!MAPS[mapId]) return;
'''
change_map_replacement = '''  function changeMap(mapId, position) {
    if (!MAPS[mapId]) return;
    playGameSfx(GAME_SFX.ROOM);
'''
if text.count(change_map_anchor) != 1:
    raise SystemExit("changeMap anchor changed; refusing audio patch")
text = text.replace(change_map_anchor, change_map_replacement, 1)

hop_anchor = '''      traversal = {
        state: TRAVERSAL_STATE.HOP,
        direction,
'''
hop_replacement = '''      playGameSfx(GAME_SFX.HOP);
      traversal = {
        state: TRAVERSAL_STATE.HOP,
        direction,
'''
if text.count(hop_anchor) != 1:
    raise SystemExit("hop traversal anchor changed; refusing audio patch")
text = text.replace(hop_anchor, hop_replacement, 1)

fall_anchor = '''      traversal = {
        state: TRAVERSAL_STATE.FALL,
        startX: player.x,
'''
fall_replacement = '''      playGameSfx(GAME_SFX.FALL);
      traversal = {
        state: TRAVERSAL_STATE.FALL,
        startX: player.x,
'''
if text.count(fall_anchor) != 1:
    raise SystemExit("fall traversal anchor changed; refusing audio patch")
text = text.replace(fall_anchor, fall_replacement, 1)

throw_anchor = '''    thrownObject = {
      ...object,
      fromX: player.x,
'''
throw_replacement = '''    playGameSfx(GAME_SFX.THROW);
    thrownObject = {
      ...object,
      fromX: player.x,
'''
if text.count(throw_anchor) != 1:
    raise SystemExit("throw object anchor changed; refusing audio patch")
text = text.replace(throw_anchor, throw_replacement, 1)

sword_anchor = '''  function swordStrike() {
    if (!player.inventory.regularSword) return;
'''
sword_replacement = '''  function swordStrike() {
    if (!player.inventory.regularSword) return;
    playGameSfx(GAME_SFX.SWORD);
'''
if text.count(sword_anchor) != 1:
    raise SystemExit("swordStrike anchor changed; refusing audio patch")
text = text.replace(sword_anchor, sword_replacement, 1)

spin_anchor = '''  function chargedSwordStrike() {
    const swordLevel = player.equipmentLevels.sword;
'''
spin_replacement = '''  function chargedSwordStrike() {
    playGameSfx(GAME_SFX.SWORD);
    const swordLevel = player.equipmentLevels.sword;
'''
if text.count(spin_anchor) != 1:
    raise SystemExit("chargedSwordStrike anchor changed; refusing audio patch")
text = text.replace(spin_anchor, spin_replacement, 1)

hit_anchor = '''  function damageEnemy(enemy, amount) {
    if (enemy.hit > 0) return;
    const boss = isPermanentEnemy(enemy.type);
'''
hit_replacement = '''  function damageEnemy(enemy, amount) {
    if (enemy.hit > 0) return;
    playGameSfx(GAME_SFX.HIT);
    const boss = isPermanentEnemy(enemy.type);
'''
if text.count(hit_anchor) != 1:
    raise SystemExit("damageEnemy anchor changed; refusing audio patch")
text = text.replace(hit_anchor, hit_replacement, 1)

chest_anchor = '''      state.openedChests[chest[0]] = true;
      reward(chest[3]);
'''
chest_replacement = '''      state.openedChests[chest[0]] = true;
      playGameSfx(GAME_SFX.CHEST);
      reward(chest[3]);
'''
if text.count(chest_anchor) != 1:
    raise SystemExit("chest reward anchor changed; refusing audio patch")
text = text.replace(chest_anchor, chest_replacement, 1)

merchant_anchor = '''    merchantStockEntry(merchantOpen, index).purchased = true;
    save();
'''
merchant_replacement = '''    merchantStockEntry(merchantOpen, index).purchased = true;
    playGameSfx(GAME_SFX.PICKUP);
    save();
'''
if text.count(merchant_anchor) != 1:
    raise SystemExit("merchant purchase anchor changed; refusing audio patch")
text = text.replace(merchant_anchor, merchant_replacement, 1)

swim_anchor = '''    if (!traversing) {
      recordSafeGround();
      startTerrainTraversal(moveDirection);
    }
'''
swim_replacement = '''    const swimmingNow = playerIsSwimming();
    if (swimmingNow !== wasSwimming) {
      playGameSfx(GAME_SFX.SPLASH);
      wasSwimming = swimmingNow;
    }
    if (!traversing) {
      recordSafeGround();
      startTerrainTraversal(moveDirection);
    }
'''
if text.count(swim_anchor) != 1:
    raise SystemExit("safe ground update anchor changed; refusing audio patch")
text = text.replace(swim_anchor, swim_replacement, 1)

transition_anchor = '''      screenTransition = {
        fromX: camera.x,
        fromY: camera.y,
        toX,
        toY,
        elapsed: 0,
        duration: 0.42,
      };
      save();
'''
transition_replacement = '''      playGameSfx(GAME_SFX.ROOM);
      screenTransition = {
        fromX: camera.x,
        fromY: camera.y,
        toX,
        toY,
        elapsed: 0,
        duration: 0.42,
      };
      save();
'''
if text.count(transition_anchor) != 1:
    raise SystemExit("screen transition anchor changed; refusing audio patch")
text = text.replace(transition_anchor, transition_replacement, 1)

keydown_anchor = '''  function onKeyDown(event) {
    const key = event.key.toLowerCase();
'''
keydown_replacement = '''  function onKeyDown(event) {
    unlockGameAudio();
    const key = event.key.toLowerCase();
'''
if text.count(keydown_anchor) != 1:
    raise SystemExit("keydown anchor changed; refusing audio patch")
text = text.replace(keydown_anchor, keydown_replacement, 1)

ENGINE.write_text(text)
