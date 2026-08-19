import { activeAttackEffect, activeAttackVisual, attackVisualFrame } from "./attackVisuals";

describe("player attack visuals", () => {
  test("normal sword swings step through four poses once", () => {
    const effect = { type: "sword", time: 0, duration: 0.18 };
    expect(attackVisualFrame(effect)).toBe(0);
    effect.time = 0.05;
    expect(attackVisualFrame(effect)).toBe(1);
    effect.time = 0.1;
    expect(attackVisualFrame(effect)).toBe(2);
    effect.time = 0.16;
    expect(attackVisualFrame(effect)).toBe(3);
    effect.time = 0.179;
    expect(attackVisualFrame(effect)).toBe(3);
  });

  test("spin attacks cycle the body poses twice", () => {
    const effect = { type: "swordSpin", time: 0.22, duration: 0.42 };
    const frame = attackVisualFrame(effect);
    expect(frame).toBeGreaterThanOrEqual(0);
    expect(frame).toBeLessThan(4);
    expect(attackVisualFrame({ ...effect, time: 0.32 })).not.toBe(frame);
  });

  test("most recent active sword effect drives the pose", () => {
    const effects = [
      { type: "dash", time: 0.1, duration: 0.3 },
      { type: "sword", time: 0.08, duration: 0.18 },
    ];
    expect(activeAttackEffect(effects).type).toBe("sword");
    expect(activeAttackVisual(effects).frame).toBe(1);
  });

  test("expired and unrelated effects do not force an attack pose", () => {
    expect(activeAttackEffect([{ type: "sword", time: 0.18, duration: 0.18 }])).toBeNull();
    expect(activeAttackVisual([{ type: "hammer", time: 0.1, duration: 0.4 }])).toBeNull();
  });
});