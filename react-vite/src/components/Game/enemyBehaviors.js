const TAU = Math.PI * 2;

function normalized(x, y) {
  const length = Math.hypot(x, y);
  if (!length) return { x: 0, y: 0 };
  return { x: x / length, y: y / length };
}

function toward(enemy, player) {
  return normalized(player.x - enemy.x, player.y - enemy.y);
}

function away(enemy, player) {
  const vector = toward(enemy, player);
  return { x: -vector.x, y: -vector.y };
}

function tangent(enemy, player, clockwise = true) {
  const vector = toward(enemy, player);
  return clockwise
    ? { x: -vector.y, y: vector.x }
    : { x: vector.y, y: -vector.x };
}

function mix(a, b, aWeight, bWeight) {
  return normalized(a.x * aWeight + b.x * bWeight, a.y * aWeight + b.y * bWeight);
}

export const ENEMY_BEHAVIOR = Object.freeze({
  CHASER: "chaser",
  CHARGER: "charger",
  SWOOPER: "swooper",
  LUNGER: "lunger",
  KEEPAWAY: "keepaway",
  BOSS: "boss",
});

export function enemyBehaviorFor(type) {
  if (type === "forestByteBeetle") return ENEMY_BEHAVIOR.CHARGER;
  if (type === "caveEchoBat" || type === "bat") return ENEMY_BEHAVIOR.SWOOPER;
  if (type === "waterCurrentBlob" || type === "slime") return ENEMY_BEHAVIOR.LUNGER;
  if (type === "dungeonFirewallDrone" || type === "guard") return ENEMY_BEHAVIOR.KEEPAWAY;
  if ([
    "boss", "knight", "mage", "minibossNullKnight",
    "bossCacheColossus", "bossFluxSovereign", "bossRootWarden",
  ].includes(type)) return ENEMY_BEHAVIOR.BOSS;
  return ENEMY_BEHAVIOR.CHASER;
}

export function enemyMotion({ enemy, player, distance, baseSpeed }) {
  const behavior = enemyBehaviorFor(enemy.type);
  const phase = ((enemy.phase || 0) % TAU + TAU) % TAU;
  const direct = toward(enemy, player);

  if (behavior === ENEMY_BEHAVIOR.CHARGER) {
    // A readable wind-up followed by a short, dangerous straight-line burst.
    const cycle = (enemy.phase || 0) % 3.1;
    if (cycle < 0.48) return { vector: { x: 0, y: 0 }, speed: 0, state: "windup" };
    if (cycle < 1.05) return { vector: direct, speed: baseSpeed * 2.45, state: "charge" };
    return { vector: direct, speed: baseSpeed * 0.62, state: "recover" };
  }

  if (behavior === ENEMY_BEHAVIOR.SWOOPER) {
    // Circle the player, periodically cutting inward instead of homing constantly.
    const orbit = tangent(enemy, player, Math.sin(phase * 0.73) >= 0);
    const inwardWeight = 0.35 + (Math.sin(phase * 1.7) + 1) * 0.27;
    return {
      vector: mix(orbit, direct, 1, inwardWeight),
      speed: baseSpeed * (1.15 + (Math.sin(phase * 2.1) + 1) * 0.22),
      state: inwardWeight > 0.7 ? "swoop" : "orbit",
    };
  }

  if (behavior === ENEMY_BEHAVIOR.LUNGER) {
    const cycle = (enemy.phase || 0) % 1.65;
    if (cycle < 0.23) return { vector: { x: 0, y: 0 }, speed: 0, state: "squash" };
    if (cycle < 0.55) return { vector: direct, speed: baseSpeed * 2.05, state: "lunge" };
    return { vector: direct, speed: baseSpeed * 0.38, state: "ooze" };
  }

  if (behavior === ENEMY_BEHAVIOR.KEEPAWAY) {
    const strafe = tangent(enemy, player, Math.sin(phase * 0.55) >= 0);
    if (distance < 145) {
      return { vector: mix(away(enemy, player), strafe, 1.2, 0.45), speed: baseSpeed * 1.05, state: "retreat" };
    }
    if (distance > 245) {
      return { vector: mix(direct, strafe, 1, 0.35), speed: baseSpeed * 0.92, state: "approach" };
    }
    return { vector: strafe, speed: baseSpeed * 0.82, state: "strafe" };
  }

  if (behavior === ENEMY_BEHAVIOR.BOSS) {
    const strafe = tangent(enemy, player, Math.sin(phase * 0.4) >= 0);
    const pulse = (Math.sin(phase * 0.9) + 1) / 2;
    return {
      vector: mix(direct, strafe, 0.72, 0.38 + pulse * 0.32),
      speed: baseSpeed * (0.78 + pulse * 0.42),
      state: pulse > 0.72 ? "pressure" : "circle",
    };
  }

  return { vector: direct, speed: baseSpeed, state: "chase" };
}
