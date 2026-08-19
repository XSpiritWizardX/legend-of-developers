import {
  canDashWhileSwimming,
  isSwimming,
  isWaterTerrain,
  swimMovementScale,
  swimTransition,
  swimVisual,
} from "./swimmingFeel";

describe("swimming feel", () => {
  test("recognizes normal and deep water", () => {
    expect(isWaterTerrain("water")).toBe(true);
    expect(isWaterTerrain("deepWater")).toBe(true);
    expect(isWaterTerrain("grass")).toBe(false);
  });

  test("flippers are required for the swimming state", () => {
    expect(isSwimming({ tile: "water", hasFlippers: false })).toBe(false);
    expect(isSwimming({ tile: "water", hasFlippers: true })).toBe(true);
    expect(isSwimming({ tile: "deepWater", hasFlippers: true })).toBe(true);
  });

  test("swimming slows movement and disables dash", () => {
    expect(swimMovementScale(false)).toBe(1);
    expect(swimMovementScale(true)).toBeCloseTo(0.72);
    expect(canDashWhileSwimming(false)).toBe(true);
    expect(canDashWhileSwimming(true)).toBe(false);
  });

  test("swimming exposes subtle bob and ripple feedback", () => {
    const idle = swimVisual({ swimming: true, moving: false, time: 0.5 });
    const moving = swimVisual({ swimming: true, moving: true, time: 0.5 });
    expect(idle).not.toBeNull();
    expect(moving.alpha).toBeGreaterThan(idle.alpha);
    expect(moving.rippleX).toBeGreaterThan(15);
  });

  test("shore transitions are reported once when state changes", () => {
    expect(swimTransition(false, true)).toBe("enter");
    expect(swimTransition(true, false)).toBe("exit");
    expect(swimTransition(true, true)).toBeNull();
  });
});