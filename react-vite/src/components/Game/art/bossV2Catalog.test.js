import { BOSS_V2_CATALOG, catalogBossArtV2 } from "./bossV2Catalog";

function primarySource(entry) {
  return entry.source || entry.frames?.[0];
}

describe("v2 boss art", () => {
  test("all named major encounters use distinct original v2 art", () => {
    expect(primarySource(catalogBossArtV2("enemies", "minibossNullKnight"))).toContain("miniboss-null-knight.svg");
    expect(primarySource(catalogBossArtV2("enemies", "bossCacheColossus"))).toContain("boss-cache-colossus.svg");
    expect(primarySource(catalogBossArtV2("enemies", "bossFluxSovereign"))).toContain("boss-flux-sovereign.svg");
    expect(primarySource(catalogBossArtV2("enemies", "bossRootWarden"))).toContain("boss-root-warden.svg");
  });

  test("animated bosses keep two-frame idle energy where authored", () => {
    expect(BOSS_V2_CATALOG.bossCacheColossus.frames).toHaveLength(2);
    expect(BOSS_V2_CATALOG.bossRootWarden.frames).toHaveLength(2);
    expect(BOSS_V2_CATALOG.bossCacheColossus.frameDuration).toBeGreaterThan(0);
    expect(BOSS_V2_CATALOG.bossRootWarden.frameDuration).toBeGreaterThan(0);
  });

  test("legacy boss aliases stay visually compatible", () => {
    expect(primarySource(BOSS_V2_CATALOG.knight)).toBe(primarySource(BOSS_V2_CATALOG.minibossNullKnight));
    expect(primarySource(BOSS_V2_CATALOG.boss)).toBe(primarySource(BOSS_V2_CATALOG.bossCacheColossus));
    expect(primarySource(BOSS_V2_CATALOG.mage)).toBe(primarySource(BOSS_V2_CATALOG.bossFluxSovereign));
  });

  test("boss art does not intercept non-enemy categories", () => {
    expect(catalogBossArtV2("props", "bossCacheColossus")).toBeNull();
    expect(catalogBossArtV2("enemies", "unknown")).toBeNull();
  });
});
