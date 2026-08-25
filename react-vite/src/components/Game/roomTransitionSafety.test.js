import {
  TRANSITION_DIRECTIONS,
  boundaryProbe,
  firstSafeTransitionLanding,
  transitionDirection,
  transitionLandingCandidates,
} from "./roomTransitionSafety";

const base = {
  toX: 1024,
  toY: 640,
  playerX: 1000,
  playerY: 900,
  tileSize: 64,
  viewWidth: 1024,
  viewHeight: 640,
};

describe("room transition safety", () => {
  test("detects cardinal transition direction", () => {
    expect(transitionDirection(0, 0, 1024, 0, 1024, 640)).toBe("e");
    expect(transitionDirection(1024, 0, 0, 0, 1024, 640)).toBe("w");
    expect(transitionDirection(0, 0, 0, 640, 1024, 640)).toBe("s");
    expect(transitionDirection(0, 640, 0, 0, 1024, 640)).toBe("n");
  });

  test("probes across the destination boundary at the player's corridor", () => {
    expect(boundaryProbe({ direction: "e", cameraX: 0, cameraY: 0, viewWidth: 1024, viewHeight: 640, playerX: 990, playerY: 320 }))
      .toEqual({ x: 1032, y: 320 });
    expect(boundaryProbe({ direction: "s", cameraX: 0, cameraY: 0, viewWidth: 1024, viewHeight: 640, playerX: 512, playerY: 620 }))
      .toEqual({ x: 512, y: 648 });
  });

  test("keeps the orthogonal position first and searches inward before drifting sideways", () => {
    const east = transitionLandingCandidates({ ...base, direction: TRANSITION_DIRECTIONS.EAST });
    expect(east[0]).toEqual({ x: 1056, y: 900 });
    expect(east[1]).toEqual({ x: 1056, y: 836 });
    expect(east[2]).toEqual({ x: 1056, y: 964 });
    expect(east[5]).toEqual({ x: 1120, y: 900 });
  });

  test("returns the first collision-safe landing rather than a fixed boundary tile", () => {
    const landing = firstSafeTransitionLanding(
      { ...base, direction: TRANSITION_DIRECTIONS.EAST },
      (x, y) => x === 1120 && y === 900,
    );
    expect(landing).toEqual({ x: 1120, y: 900 });
  });

  test("returns null when the destination corridor has no valid landing", () => {
    expect(firstSafeTransitionLanding(
      { ...base, direction: TRANSITION_DIRECTIONS.NORTH },
      () => false,
    )).toBeNull();
  });
});
