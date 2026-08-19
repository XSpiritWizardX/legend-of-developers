import {
  advanceEnemyProjectile,
  enemyProjectileExpired,
  enemyProjectileHitsPlayer,
  rootboundBossVolley,
} from "./enemyAttacks";

describe("enemy attack patterns", () => {
  const boss = { x: 0, y: 0 };
  const player = { x: 100, y: 0 };

  test("phase one fires a readable three-shot fan", () => {
    const volley = rootboundBossVolley({ boss, player, phase: 1 });
    expect(volley).toHaveLength(3);
    expect(volley.every((shot) => shot.delay > 0)).toBe(true);
    expect(volley[1].vx).toBeGreaterThan(0);
    expect(Math.abs(volley[1].vy)).toBeLessThan(0.001);
    expect(volley[0].vy).toBeLessThan(0);
    expect(volley[2].vy).toBeGreaterThan(0);
  });

  test("phase two adds a radial ring plus a faster targeted shard", () => {
    const volley = rootboundBossVolley({ boss, player, phase: 2 });
    expect(volley).toHaveLength(9);
    const fastest = Math.max(...volley.map((shot) => Math.hypot(shot.vx, shot.vy)));
    expect(fastest).toBeGreaterThan(240);
  });

  test("projectiles hold during telegraph then advance", () => {
    const [shot] = rootboundBossVolley({ boss, player, phase: 1 });
    const telegraph = advanceEnemyProjectile(shot, 0.05);
    expect(telegraph.x).toBe(0);
    expect(telegraph.age).toBe(0);
    const armed = { ...shot, delay: 0 };
    const moved = advanceEnemyProjectile(armed, 0.05);
    expect(moved.x).toBeGreaterThan(0);
    expect(moved.age).toBeCloseTo(0.05);
  });

  test("collision ignores telegraph state and respects projectile radius", () => {
    const [shot] = rootboundBossVolley({ boss, player, phase: 1 });
    expect(enemyProjectileHitsPlayer(shot, { x: 0, y: 0 })).toBe(false);
    expect(enemyProjectileHitsPlayer({ ...shot, delay: 0, x: 90, y: 0 }, player)).toBe(true);
  });

  test("projectiles expire after their active duration", () => {
    const [shot] = rootboundBossVolley({ boss, player, phase: 1 });
    expect(enemyProjectileExpired({ ...shot, age: shot.duration - 0.01 })).toBe(false);
    expect(enemyProjectileExpired({ ...shot, age: shot.duration })).toBe(true);
  });
});
