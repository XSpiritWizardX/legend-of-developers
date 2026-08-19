from pathlib import Path

ENGINE = Path("react-vite/src/components/Game/engine.js")
text = ENGINE.read_text()

import_anchor = 'import { showcaseTerrainAt } from "./showcaseTerrain";\n'
import_replacement = import_anchor + '''import {
  canDashWhileSwimming, isSwimming, swimMovementScale, swimVisual,
} from "./swimmingFeel";
'''
if text.count(import_anchor) != 1:
    raise SystemExit("showcaseTerrain import anchor changed; refusing patch")
text = text.replace(import_anchor, import_replacement, 1)

terrain_anchor = '''  function terrainAtPoint(x, y) {
    return tileAt(state.mapId, Math.floor(x / TILE), Math.floor(y / TILE), state.flags);
  }
'''
terrain_replacement = terrain_anchor + '''  function playerIsSwimming() {
    return isSwimming({
      tile: terrainAtPoint(player.x, player.y + 10),
      hasFlippers: player.inventory.flippers,
    });
  }
'''
if text.count(terrain_anchor) != 1:
    raise SystemExit("terrainAtPoint anchor changed; refusing patch")
text = text.replace(terrain_anchor, terrain_replacement, 1)

movement_anchor = '''      const moveSpeed = player.speed * movementScale({
        carrying: Boolean(carriedObject),
        attacking: player.attackTime > 0,
        charging: player.swordCharging,
      });
'''
movement_replacement = '''      const moveSpeed = player.speed * movementScale({
        carrying: Boolean(carriedObject),
        attacking: player.attackTime > 0,
        charging: player.swordCharging,
      }) * swimMovementScale(playerIsSwimming());
'''
if text.count(movement_anchor) != 1:
    raise SystemExit("movement speed anchor changed; refusing patch")
text = text.replace(movement_anchor, movement_replacement, 1)

dash_anchor = '''    if (!traversing && !traversal && pressed.shift) dash();
'''
dash_replacement = '''    if (
      !traversing && !traversal && pressed.shift
      && canDashWhileSwimming(playerIsSwimming())
    ) dash();
'''
if text.count(dash_anchor) != 1:
    raise SystemExit("dash input anchor changed; refusing patch")
text = text.replace(dash_anchor, dash_replacement, 1)

draw_anchor = '''    const traversalOffset = traversal?.state === TRAVERSAL_STATE.HOP
      ? -Math.sin(traversalProgress * Math.PI) * 28
      : (traversal?.state === TRAVERSAL_STATE.FALL ? traversalProgress * 10 : 0);
    const y = screenY(player.y) + bob + traversalOffset;
'''
draw_replacement = '''    const traversalOffset = traversal?.state === TRAVERSAL_STATE.HOP
      ? -Math.sin(traversalProgress * Math.PI) * 28
      : (traversal?.state === TRAVERSAL_STATE.FALL ? traversalProgress * 10 : 0);
    const swim = swimVisual({
      swimming: playerIsSwimming(),
      moving: player.moving,
      time: performance.now() / 1000,
    });
    const y = screenY(player.y) + bob + traversalOffset + (swim?.bobY || 0);
'''
if text.count(draw_anchor) != 1:
    raise SystemExit("drawPlayer y anchor changed; refusing patch")
text = text.replace(draw_anchor, draw_replacement, 1)

shadow_anchor = '''    ctx.fillStyle = "#02060a66";
    ctx.beginPath();
    ctx.ellipse(x, y + 13, 16, 5, 0, 0, Math.PI * 2);
    ctx.fill();
'''
shadow_replacement = '''    ctx.fillStyle = "#02060a66";
    ctx.beginPath();
    ctx.ellipse(x, y + 13, 16, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    if (swim) {
      ctx.save();
      ctx.globalAlpha = swim.alpha;
      ctx.strokeStyle = "#d7dfd3";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x, y + 10, swim.rippleX, swim.rippleY, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
'''
if text.count(shadow_anchor) != 1:
    raise SystemExit("player shadow anchor changed; refusing patch")
text = text.replace(shadow_anchor, shadow_replacement, 1)

return_anchor = '''        ctx.restore();
      }
      return;
    }
'''
return_replacement = '''        ctx.restore();
      }
      if (swim) {
        ctx.save();
        ctx.globalAlpha = 0.58;
        ctx.fillStyle = "#4e7880";
        ctx.beginPath();
        ctx.ellipse(x, y + 13, 18, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.78;
        ctx.strokeStyle = "#d7dfd3";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(x, y + 10, swim.rippleX, swim.rippleY, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      return;
    }
'''
if text.count(return_anchor) != 1:
    raise SystemExit("player catalog return anchor changed or ambiguous; refusing patch")
text = text.replace(return_anchor, return_replacement, 1)

ENGINE.write_text(text)
