import { ENEMY_BEHAVIOR, enemyBehaviorFor, enemyMotion } from "./enemyBehaviors";

const player = { x: 100, y: 0 };
const motion = (type, phase, distance = 100, baseSpeed = 60) => enemyMotion({
  enemy: { type, x: 0, y: 0, phase },
  player,
  distance,
  baseSpeed,
});

describe("enemy movement archetypes", () => {
  test("maps common enemies to different behavior families", () => {
    expect(enemyBehaviorFor("forestByteBeetle")).toBe(ENEMY_BEHAVIOR.CHARGER);
    expect(enemyBehaviorFor("caveEchoBat")).toBe(ENEMY_BEHAVIOR.SWOOPER);
    expect(enemyBehaviorFor("waterCurrentBlob")).toBe(ENEMY_BEHAVIOR.LUNGER);
    expect(enemyBehaviorFor("dungeonFirewallDrone")).toBe(ENEMY_BEHAVIOR.KEEPAWAY);
    expect(enemyBehaviorFor("bossCacheColossus")).toBe(ENEMY_BEHAVIOR.BOSS);
  });

  test("beetles telegraph and then charge faster than their base speed", () => {
    expect(motion("forestByteBeetle", 0.2).state).toBe("windup");
    const charge = motion("forestByteBeetle", 0.7);
    expect(charge.state).toBe("charge");
    expect(charge.speed).toBeGreaterThan(120);
    expect(charge.vector.x).toBeCloseTo(1);
  });

  test("bats use a tangential component instead of pure homing", () => {
    const swoop = motion("caveEchoBat", 1.1, 170, 100);
    expect(["orbit", "swoop"]).toContain(swoop.state);
    expect(Math.abs(swoop.vector.y)).toBeGreaterThan(0.2);
  });

  test("blobs alternate squash, lunge and slow ooze phases", () => {
    expect(motion("waterCurrentBlob", 0.1).state).toBe("squash");
    expect(motion("waterCurrentBlob", 0.35).state).toBe("lunge");
    expect(motion("waterCurrentBlob", 1.1).state).toBe("ooze");
  });

  test("drones retreat nearby, approach far away and strafe at preferred range", () => {
    expect(motion("dungeonFirewallDrone", 1, 100).state).toBe("retreat");
    expect(motion("dungeonFirewallDrone", 1, 300).state).toBe("approach");
    const strafe = motion("dungeonFirewallDrone", 1, 190);
    expect(strafe.state).toBe("strafe");
    expect(Math.abs(strafe.vector.y)).toBeGreaterThan(0.5);
  });

  test("bosses blend pursuit and circling without stopping", () => {
    const boss = motion("bossRootWarden", 2.3, 180, 80);
    expect(["pressure", "circle"]).toContain(boss.state);
    expect(boss.speed).toBeGreaterThan(0);
    expect(Math.hypot(boss.vector.x, boss.vector.y)).toBeCloseTo(1);
  });
});