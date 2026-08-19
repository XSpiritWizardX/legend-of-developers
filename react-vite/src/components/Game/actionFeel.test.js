import {
  cardinalFacing,
  decayKnockback,
  hitStopFor,
  interactionPoint,
  knockbackVector,
  movementScale,
  nearestFacingTarget,
  targetInFront,
} from "./actionFeel";

describe("action-adventure feel primitives", () => {
  const player = { x: 100, y: 100, dir: "down-right" };

  test("diagonal facing resolves to a stable cardinal interaction direction", () => {
    expect(cardinalFacing("down-right")).toBe("right");
    expect(cardinalFacing("up-left")).toBe("left");
    expect(interactionPoint(player, 40)).toEqual({ x: 140, y: 100 });
  });

  test("context interactions select the nearest target in front, not behind the player", () => {
    const targets = [
      { id: "behind", x: 55, y: 100 },
      { id: "far", x: 165, y: 101 },
      { id: "near", x: 136, y: 104 },
    ];
    expect(targetInFront({ player, target: targets[0] })).toBe(false);
    expect(nearestFacingTarget({ player, targets })?.id).toBe("near");
  });

  test("knockback points away from the attacker and decays smoothly", () => {
    const velocity = knockbackVector({ x: 0, y: 0 }, { x: 3, y: 4 }, 100);
    expect(velocity.x).toBeCloseTo(60);
    expect(velocity.y).toBeCloseTo(80);
    const decayed = decayKnockback(velocity, 1 / 60);
    expect(decayed.x).toBeGreaterThan(0);
    expect(decayed.x).toBeLessThan(velocity.x);
    expect(decayed.y).toBeLessThan(velocity.y);
  });

  test("strong and boss hits receive slightly more hit stop", () => {
    expect(hitStopFor({ damage: 1 })).toBeLessThan(hitStopFor({ damage: 3 }));
    expect(hitStopFor({ damage: 3 })).toBeLessThan(hitStopFor({ boss: true }));
  });

  test("movement remains responsive while actions add only modest commitment", () => {
    expect(movementScale()).toBe(1);
    expect(movementScale({ carrying: true })).toBeGreaterThan(0.8);
    expect(movementScale({ attacking: true })).toBeGreaterThan(0.65);
  });
});