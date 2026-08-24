export const DEFAULT_TILE_SIZE = 64;

export const TERRAIN = Object.freeze({
  LEDGE_DOWN: "ledgeDown",
  LEDGE_UP: "ledgeUp",
  LEDGE_LEFT: "ledgeLeft",
  LEDGE_RIGHT: "ledgeRight",
  PIT: "pit",
  DEEP_WATER: "deepWater",
  STAIRS: "stairs",
  RAMP: "ramp",
});

export const TRAVERSAL_STATE = Object.freeze({
  WALK: "walk",
  HOP: "hop",
  FALL: "fall",
  LAND: "land",
  RECOVER: "recover",
  SWIM: "swim",
  LIFT: "lift",
  CARRY: "carry",
  THROW: "throw",
  PUSH: "push",
  PULL: "pull",
});

export const ELEVATION_TRANSITION = Object.freeze({
  LEVEL: "level",
  ASCEND: "ascend",
  DESCEND: "descend",
});

const DIRECTION_VECTOR = Object.freeze({
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
});

const LEDGE_DIRECTION = Object.freeze({
  [TERRAIN.LEDGE_UP]: "up",
  [TERRAIN.LEDGE_DOWN]: "down",
  [TERRAIN.LEDGE_LEFT]: "left",
  [TERRAIN.LEDGE_RIGHT]: "right",
});

export function directionVector(direction) {
  return DIRECTION_VECTOR[direction] || DIRECTION_VECTOR.down;
}

export function isDirectionalLedge(tile) {
  return Object.prototype.hasOwnProperty.call(LEDGE_DIRECTION, tile);
}

export function ledgeDirection(tile) {
  return LEDGE_DIRECTION[tile] || null;
}

export function canHopLedge(tile, direction) {
  return ledgeDirection(tile) === direction;
}

export function isPit(tile) {
  return tile === TERRAIN.PIT;
}

export function isSwimmable(tile, hasFlippers) {
  return tile === TERRAIN.DEEP_WATER && Boolean(hasFlippers);
}

export function isElevationTransition(tile) {
  return tile === TERRAIN.STAIRS || tile === TERRAIN.RAMP;
}

export function elevationTransitionFor({ tile, direction }) {
  if (!isElevationTransition(tile)) return ELEVATION_TRANSITION.LEVEL;
  if (direction === "up") return ELEVATION_TRANSITION.ASCEND;
  if (direction === "down") return ELEVATION_TRANSITION.DESCEND;
  return ELEVATION_TRANSITION.LEVEL;
}

export function elevationAllowsMovement({ fromElevation = 0, toElevation = 0, tile, direction }) {
  const delta = toElevation - fromElevation;
  if (delta === 0) return true;
  if (!isElevationTransition(tile)) return false;
  const transition = elevationTransitionFor({ tile, direction });
  if (delta > 0) return transition === ELEVATION_TRANSITION.ASCEND;
  return transition === ELEVATION_TRANSITION.DESCEND;
}

export function terrainTraversalFor({ tile, direction, hasFlippers = false }) {
  if (isDirectionalLedge(tile)) {
    return canHopLedge(tile, direction)
      ? { state: TRAVERSAL_STATE.HOP, blocksMovement: false }
      : { state: TRAVERSAL_STATE.WALK, blocksMovement: true };
  }
  if (isPit(tile)) {
    return { state: TRAVERSAL_STATE.FALL, blocksMovement: false };
  }
  if (tile === TERRAIN.DEEP_WATER) {
    return hasFlippers
      ? { state: TRAVERSAL_STATE.SWIM, blocksMovement: false }
      : { state: TRAVERSAL_STATE.WALK, blocksMovement: true };
  }
  return { state: TRAVERSAL_STATE.WALK, blocksMovement: false };
}

export function traversalVisualState({
  traversal = null,
  swimming = false,
  carrying = false,
  throwing = false,
  pushing = false,
  pulling = false,
  moving = false,
} = {}) {
  if (traversal?.state === TRAVERSAL_STATE.FALL) return TRAVERSAL_STATE.FALL;
  if (traversal?.state === TRAVERSAL_STATE.HOP) return TRAVERSAL_STATE.HOP;
  if (traversal?.state === TRAVERSAL_STATE.RECOVER) return TRAVERSAL_STATE.LAND;
  if (throwing) return TRAVERSAL_STATE.THROW;
  if (pushing) return TRAVERSAL_STATE.PUSH;
  if (pulling) return TRAVERSAL_STATE.PULL;
  if (carrying) return TRAVERSAL_STATE.CARRY;
  if (swimming) return TRAVERSAL_STATE.SWIM;
  return moving ? TRAVERSAL_STATE.WALK : TRAVERSAL_STATE.WALK;
}

export function ledgeLandingPoint({
  x,
  y,
  direction,
  tileSize = DEFAULT_TILE_SIZE,
}) {
  const vector = directionVector(direction);
  // Move far enough to clear the source ledge tile and land safely on the
  // next walkable tile. The runtime can animate the player along this arc.
  const travel = tileSize * 1.15;
  return {
    x: x + vector.x * travel,
    y: y + vector.y * travel,
  };
}

export function interactionProbe({
  x,
  y,
  direction,
  distance = DEFAULT_TILE_SIZE * 0.62,
}) {
  const vector = directionVector(direction);
  return {
    x: x + vector.x * distance,
    y: y + vector.y * distance,
  };
}

export function rememberSafeGround(history, point, maxEntries = 8) {
  const next = [...(history || []), { x: point.x, y: point.y }];
  return next.slice(Math.max(0, next.length - maxEntries));
}

export function recoveryPoint(history, fallback) {
  const last = history?.[history.length - 1];
  return last ? { ...last } : { ...fallback };
}
