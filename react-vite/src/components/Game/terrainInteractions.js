import { TILE } from "./world";

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
  RECOVER: "recover",
  SWIM: "swim",
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

export function ledgeLandingPoint({ x, y, direction, tileSize = TILE }) {
  const vector = directionVector(direction);
  // Move far enough to clear the source ledge tile and land safely on the
  // next walkable tile. The runtime can animate the player along this arc.
  const travel = tileSize * 1.15;
  return {
    x: x + vector.x * travel,
    y: y + vector.y * travel,
  };
}

export function interactionProbe({ x, y, direction, distance = TILE * 0.62 }) {
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
