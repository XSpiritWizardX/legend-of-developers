from pathlib import Path

ENGINE = Path("react-vite/src/components/Game/engine.js")
text = ENGINE.read_text()

# 1) Import attack pose timing helper.
import_anchor = '''import {
  decayKnockback, hitStopFor, knockbackVector, movementScale, nearestFacingTarget, targetInFront,
} from "./actionFeel";
'''
import_replacement = import_anchor + 'import { activeAttackVisual } from "./attackVisuals";\n'
if text.count(import_anchor) != 1:
    raise SystemExit("actionFeel import anchor changed; refusing patch")
text = text.replace(import_anchor, import_replacement, 1)

# 2) Keep sword body/effect animation aligned a little longer without changing hit detection.
sword_anchor = '''      upgraded: Boolean(player.inventory.masterSword),
      time: 0, duration: 0.13,
'''
sword_replacement = '''      upgraded: Boolean(player.inventory.masterSword),
      time: 0, duration: 0.18,
'''
if text.count(sword_anchor) != 1:
    raise SystemExit("sword duration anchor changed; refusing patch")
text = text.replace(sword_anchor, sword_replacement, 1)

# 3) Render directional attack body poses from the active sword effect timeline.
player_anchor = '''    const renderDirection = spriteDirection(player.dir);
    if (drawCatalogArt(
      ctx,
      "characters",
      "playerWalk",
      x - 32,
      y - 53,
      64,
      64,
      {
        direction: renderDirection,
        frame: walkFrame,
      },
    )) {
      if (player.attackTime <= 0) {
'''
player_replacement = '''    const renderDirection = spriteDirection(player.dir);
    const attackVisual = activeAttackVisual(weaponEffects);
    const playerArtId = attackVisual ? "playerAttack" : "playerWalk";
    const playerFrame = attackVisual?.frame ?? walkFrame;
    if (drawCatalogArt(
      ctx,
      "characters",
      playerArtId,
      x - 32,
      y - 53,
      64,
      64,
      {
        direction: renderDirection,
        frame: playerFrame,
      },
    )) {
      if (!attackVisual && player.attackTime <= 0) {
'''
if text.count(player_anchor) != 1:
    raise SystemExit("drawPlayer catalog anchor changed; refusing patch")
text = text.replace(player_anchor, player_replacement, 1)

# 4) Make legacy room slides read as crisp transitions instead of long camera drifts.
transition_anchor = '''      screenTransition = {
        fromX: camera.x,
        fromY: camera.y,
        toX,
        toY,
        elapsed: 0,
        duration: 0.62,
      };
'''
transition_replacement = '''      screenTransition = {
        fromX: camera.x,
        fromY: camera.y,
        toX,
        toY,
        elapsed: 0,
        duration: 0.42,
      };
'''
if text.count(transition_anchor) != 1:
    raise SystemExit("screen transition anchor changed; refusing patch")
text = text.replace(transition_anchor, transition_replacement, 1)

ENGINE.write_text(text)
