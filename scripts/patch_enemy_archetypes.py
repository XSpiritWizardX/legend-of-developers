from pathlib import Path

ENGINE = Path("react-vite/src/components/Game/engine.js")
text = ENGINE.read_text()

import_anchor = 'import { activeAttackVisual } from "./attackVisuals";\n'
import_replacement = import_anchor + 'import { enemyMotion } from "./enemyBehaviors";\n'
if text.count(import_anchor) != 1:
    raise SystemExit("attackVisual import anchor changed; refusing patch")
text = text.replace(import_anchor, import_replacement, 1)

movement_anchor = '''      const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y);
      if (!enemy.stunned && knockbackSpeed < 18 && distance < 310 && distance > 0) {
        const speed = enemy.type === "bat" ? 100 : isPermanentEnemy(enemy.type) ? 80 : 58;
        const nx = enemy.x + (player.x - enemy.x) / distance * speed * dt;
        const ny = enemy.y + (player.y - enemy.y) / distance * speed * dt;
        if (enemyCanMove(enemy, nx, enemy.y)) enemy.x = nx;
        if (enemyCanMove(enemy, enemy.x, ny)) enemy.y = ny;
      }
'''
movement_replacement = '''      const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y);
      if (!enemy.stunned && knockbackSpeed < 18 && distance < 310 && distance > 0) {
        const baseSpeed = enemy.type === "bat" || enemy.type === "caveEchoBat"
          ? 100
          : (isPermanentEnemy(enemy.type) ? 80 : 58);
        const motion = enemyMotion({ enemy, player, distance, baseSpeed });
        enemy.aiState = motion.state;
        const nx = enemy.x + motion.vector.x * motion.speed * dt;
        const ny = enemy.y + motion.vector.y * motion.speed * dt;
        if (enemyCanMove(enemy, nx, enemy.y)) enemy.x = nx;
        if (enemyCanMove(enemy, enemy.x, ny)) enemy.y = ny;
      } else if (enemy.stunned) {
        enemy.aiState = "stunned";
      }
'''
if text.count(movement_anchor) != 1:
    raise SystemExit("enemy movement anchor changed; refusing patch")
text = text.replace(movement_anchor, movement_replacement, 1)

telegraph_anchor = '''    ctx.beginPath();
    ctx.ellipse(x, y + (boss ? 24 : 14), boss ? 34 : 18, boss ? 11 : 6, 0, 0, Math.PI * 2);
    ctx.fill();
    if (drawCatalogArt(ctx, "enemies", enemy.type, x - 32, y - 44, 64, 64)) {
'''
telegraph_replacement = '''    ctx.beginPath();
    ctx.ellipse(x, y + (boss ? 24 : 14), boss ? 34 : 18, boss ? 11 : 6, 0, 0, Math.PI * 2);
    ctx.fill();
    if (["windup", "squash"].includes(enemy.aiState)) {
      const pulse = 3 + Math.sin(enemy.phase * 18) * 2;
      ctx.strokeStyle = enemy.aiState === "windup" ? "#d4b76b" : "#8fa39a";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(x, y + 13, 22 + pulse, 9 + pulse * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (["charge", "lunge", "swoop", "pressure"].includes(enemy.aiState)) {
      ctx.globalAlpha = 0.28;
      ctx.fillStyle = enemy.aiState === "pressure" ? "#b96f5d" : "#d4b76b";
      ctx.beginPath();
      ctx.ellipse(x, y + 10, boss ? 39 : 25, boss ? 15 : 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    if (drawCatalogArt(ctx, "enemies", enemy.type, x - 32, y - 44, 64, 64)) {
'''
if text.count(telegraph_anchor) != 1:
    raise SystemExit("enemy render anchor changed; refusing patch")
text = text.replace(telegraph_anchor, telegraph_replacement, 1)

ENGINE.write_text(text)
