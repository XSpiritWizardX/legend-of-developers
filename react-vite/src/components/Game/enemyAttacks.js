const TAU = Math.PI * 2;

export const ENEMY_PROJECTILE_KIND = Object.freeze({
  ROOT_SHARD: "rootShard",
});

function directionTo(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  return { x: dx / length, y: dy / length };
}

function rotate(vector, radians) {
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return {
    x: vector.x * cos - vector.y * sin,
    y: vector.x * sin + vector.y * cos,
  };
}

function projectile({ x, y, vector, speed, delay, duration, damage = 1, radius = 10 }) {
  return {
    kind: ENEMY_PROJECTILE_KIND.ROOT_SHARD,
    x,
    y,
    originX: x,
    originY: y,
    vx: vector.x * speed,
    vy: vector.y * speed,
    delay,
    age: 0,
    duration,
    damage,
    radius,
  };
}

export function rootboundBossVolley({ boss, player, phase = 1 }) {
  if (!boss || !player) return [];
  const direct = directionTo(boss, player);
  const delay = phase >= 2 ? 0.38 : 0.48;

  if (phase < 2) {
    return [-0.19, 0, 0.19].map((angle) => projectile({
      x: boss.x,
      y: boss.y,
      vector: rotate(direct, angle),
      speed: 195,
      delay,
      duration: 2.25,
      radius: 10,
    }));
  }

  const radial = Array.from({ length: 8 }, (_, index) => {
    const angle = (index / 8) * TAU;
    return projectile({
      x: boss.x,
      y: boss.y,
      vector: { x: Math.cos(angle), y: Math.sin(angle) },
      speed: 175,
      delay,
      duration: 2.45,
      radius: 11,
    });
  });
  radial.push(projectile({
    x: boss.x,
    y: boss.y,
    vector: direct,
    speed: 255,
    delay: delay + 0.08,
    duration: 2.1,
    radius: 12,
  }));
  return radial;
}

export function advanceEnemyProjectile(projectileState, dt) {
  if (!projectileState) return null;
  const safeDt = Math.max(0, Math.min(0.05, dt || 0));
  const next = { ...projectileState };
  if (next.delay > 0) {
    next.delay = Math.max(0, next.delay - safeDt);
    return next;
  }
  next.age += safeDt;
  next.x += next.vx * safeDt;
  next.y += next.vy * safeDt;
  return next;
}

export function enemyProjectileExpired(projectileState) {
  return !projectileState || projectileState.age >= projectileState.duration;
}

export function enemyProjectileHitsPlayer(projectileState, player, playerRadius = 14) {
  if (!projectileState || !player || projectileState.delay > 0) return false;
  return Math.hypot(projectileState.x - player.x, projectileState.y - player.y)
    <= projectileState.radius + playerRadius;
}

export function enemyProjectileTelegraph(projectileState) {
  if (!projectileState || projectileState.delay <= 0) return null;
  const total = Math.max(0.001, projectileState.delay + 0.001);
  return {
    x: projectileState.originX,
    y: projectileState.originY,
    radius: 24 + Math.min(1, 0.5 / total) * 12,
  };
}
