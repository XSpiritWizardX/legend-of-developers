export const TRANSITION_DIRECTIONS = Object.freeze({
  EAST: "e",
  WEST: "w",
  SOUTH: "s",
  NORTH: "n",
});

export function transitionDirection(fromX, fromY, toX, toY, viewWidth, viewHeight) {
  if (toX - fromX >= viewWidth - 1) return TRANSITION_DIRECTIONS.EAST;
  if (fromX - toX >= viewWidth - 1) return TRANSITION_DIRECTIONS.WEST;
  if (toY - fromY >= viewHeight - 1) return TRANSITION_DIRECTIONS.SOUTH;
  if (fromY - toY >= viewHeight - 1) return TRANSITION_DIRECTIONS.NORTH;
  return null;
}

export function boundaryProbe({ direction, cameraX, cameraY, viewWidth, viewHeight, playerX, playerY, inset = 8 }) {
  if (direction === TRANSITION_DIRECTIONS.EAST) return { x: cameraX + viewWidth + inset, y: playerY };
  if (direction === TRANSITION_DIRECTIONS.WEST) return { x: cameraX - inset, y: playerY };
  if (direction === TRANSITION_DIRECTIONS.SOUTH) return { x: playerX, y: cameraY + viewHeight + inset };
  if (direction === TRANSITION_DIRECTIONS.NORTH) return { x: playerX, y: cameraY - inset };
  return { x: playerX, y: playerY };
}

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

export function transitionLandingCandidates({
  direction,
  toX,
  toY,
  playerX,
  playerY,
  tileSize,
  viewWidth,
  viewHeight,
}) {
  const halfTile = tileSize / 2;
  const minX = toX + halfTile;
  const maxX = toX + viewWidth - halfTile;
  const minY = toY + halfTile;
  const maxY = toY + viewHeight - halfTile;
  const sideways = [0, -1, 1, -2, 2].map((offset) => offset * tileSize);
  const inward = [0, 1, 2, 3].map((offset) => halfTile + offset * tileSize);
  const candidates = [];

  for (const depth of inward) {
    for (const offset of sideways) {
      if (direction === TRANSITION_DIRECTIONS.EAST) {
        candidates.push({
          x: clamp(toX + depth, minX, maxX),
          y: clamp(playerY + offset, minY, maxY),
        });
      } else if (direction === TRANSITION_DIRECTIONS.WEST) {
        candidates.push({
          x: clamp(toX + viewWidth - depth, minX, maxX),
          y: clamp(playerY + offset, minY, maxY),
        });
      } else if (direction === TRANSITION_DIRECTIONS.SOUTH) {
        candidates.push({
          x: clamp(playerX + offset, minX, maxX),
          y: clamp(toY + depth, minY, maxY),
        });
      } else if (direction === TRANSITION_DIRECTIONS.NORTH) {
        candidates.push({
          x: clamp(playerX + offset, minX, maxX),
          y: clamp(toY + viewHeight - depth, minY, maxY),
        });
      }
    }
  }

  const seen = new Set();
  return candidates.filter(({ x, y }) => {
    const key = `${x},${y}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function firstSafeTransitionLanding(options, isOpen) {
  return transitionLandingCandidates(options).find(({ x, y }) => isOpen(x, y)) || null;
}
