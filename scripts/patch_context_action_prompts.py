from pathlib import Path

ENGINE = Path("react-vite/src/components/Game/engine.js")
text = ENGINE.read_text()

import_anchor = 'import { activeAttackVisual } from "./attackVisuals";\n'
import_replacement = import_anchor + 'import { contextActionLabel, contextActionText } from "./contextAction";\n'
if text.count(import_anchor) != 1:
    raise SystemExit("attackVisual import anchor changed; refusing patch")
text = text.replace(import_anchor, import_replacement, 1)

interact_anchor = '''  function interact() {
    if (interactWorldObject()) return;
'''
resolver = '''  function currentContextAction() {
    if (carriedObject) return contextActionLabel({ carried: true });
    const direction = interactionDirection();
    const worldObject = facingWorldObject({
      objects: currentWorldObjects(),
      player,
      direction,
      distance: 44,
      radius: 34,
    });
    if (worldObject) {
      return contextActionLabel({
        worldObject,
        canLift: canLiftWorldObject(worldObject, player.inventory),
      });
    }

    const currentMap = map();
    if (state.mapId === "overworld") {
      const dungeon = nearestFacingTarget({
        player,
        targets: DUNGEONS.map((entry) => ({ ...entry, x: entry.entrance.x, y: entry.entrance.y })),
        reach: 96,
        halfAngle: 1.08,
      });
      if (dungeon) return contextActionLabel({ dungeon: true });
      const merchant = nearestFacingTarget({
        player,
        targets: MERCHANTS.map((entry) => ({
          ...entry,
          x: entry.x * TILE + TILE / 2,
          y: entry.y * TILE + TILE / 2,
        })),
        reach: 86,
        halfAngle: 1.02,
      });
      if (merchant) return contextActionLabel({ merchant: true });
    } else if (targetInFront({ player, target: currentMap.exit, reach: 86, halfAngle: 1.08 })) {
      return contextActionLabel({ exit: true });
    }

    const chest = nearestFacingTarget({
      player,
      targets: currentMap.chests
        .filter(([id]) => !state.openedChests[id])
        .filter(([id]) => !(id.endsWith("-reward")
          && enemiesByMap[state.mapId].some((enemy) => isPermanentEnemy(enemy.type))))
        .map((entry) => ({
          x: entry[1] * TILE + TILE / 2,
          y: entry[2] * TILE + TILE / 2,
        })),
      reach: 80,
      halfAngle: 1.04,
    });
    return chest ? contextActionLabel({ chest: true }) : null;
  }

'''
if text.count(interact_anchor) != 1:
    raise SystemExit("interact anchor changed; refusing patch")
text = text.replace(interact_anchor, resolver + interact_anchor, 1)

merchant_anchor = '''  function buyMerchantItem(index) {
'''
draw_prompt = '''  function drawContextActionPrompt() {
    if (paused || mapOpen || inventoryOpen || merchantOpen || messageTime > 0) return;
    const action = currentContextAction();
    if (!action) return;
    const label = contextActionText(action);
    const width = Math.max(118, label.length * 9 + 34);
    const x = Math.round((VIEW_W - width) / 2);
    const y = HUD_H + VIEW_H - 46;
    rect(x, y, width, 30, "#11171fee");
    ctx.strokeStyle = "#b38b52";
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, width - 2, 28);
    text(label, VIEW_W / 2, y + 20, 10, "center", "#e9dfbf");
  }

'''
if text.count(merchant_anchor) != 1:
    raise SystemExit("merchant helper anchor changed; refusing patch")
text = text.replace(merchant_anchor, draw_prompt + merchant_anchor, 1)

message_anchor = '''    if (messageTime > 0) {
      rect(240, 494 + HUD_H, 480, 60, "#11131ef0");
'''
message_replacement = '''    drawContextActionPrompt();
    if (messageTime > 0) {
      rect(240, 494 + HUD_H, 480, 60, "#11131ef0");
'''
if text.count(message_anchor) != 1:
    raise SystemExit("message render anchor changed; refusing patch")
text = text.replace(message_anchor, message_replacement, 1)

ENGINE.write_text(text)
