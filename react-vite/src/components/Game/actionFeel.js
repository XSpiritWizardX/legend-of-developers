const CARDINAL_VECTORS = Object.freeze({
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
});

export function cardinalFacing(direction = "down") {
  if (direction.includes("left")) return "left";
  if (direction.includes("right")) return "right";
  if (direction.includes("up")) return "up";
  return "down";
}

export function facingVector(direction) {
  return CARDINAL_VECTORS[cardinalFacing(direction)];
}

export function interactionPoint(player, distance = 46) {
  const vector = facingVector(player.dir);
  return {
    x: player.x + vector.x * distance,
    y: player.y + vector.y * distance,
  };
}

export function targetInFront({ player, target, reach = 72, halfAngle = 0.92 }) {
  const dx = target.x - player.x;
  const dy = target.y - player.y;
  const distance = Math.hypot(dx, dy);
  if (distance > reach) return false;
  if (distance < 0.001) return true;
  const facing = facingVector(player.dir);
  const dot = (dx / distance) * facing.x + (dy / distance) * facing.y;
  return dot >= Math.cos(halfAngle);
}

export function nearestFacingTarget({ player, targets, reach = 72, halfAngle = 0.92 }) {
  return (targets || [])
    .filter((target) => targetInFront({ player, target, reach, halfAngle }))
    .map((target) => ({
      target,
      distance: Math.hypot(target.x - player.x, target.y - player.y),
    }))
    .sort((a, b) => a.distance - b.distance)[0]?.target || null;
}

export function knockbackVector(from, to, strength = 170) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy) || 1;
  return {
    x: (dx / distance) * strength,
    y: (dy / distance) * strength,
  };
}

export function decayKnockback(velocity, dt, damping = 14) {
  const factor = Math.exp(-Math.max(0, damping) * Math.max(0, dt));
  return {
    x: velocity.x * factor,
    y: velocity.y * factor,
  };
}

export function hitStopFor({ damage = 1, boss = false, charged = false } = {}) {
  if (boss || charged) return 0.065;
  if (damage >= 3) return 0.055;
  if (damage >= 2) return 0.045;
  return 0.032;
}

export function movementScale({ carrying = false, attacking = false, charging = false } = {}) {
  if (attacking) return 0.72;
  if (charging) return 0.82;
  if (carrying) return 0.88;
  return 1;
}
