import { BOSS_V2_CATALOG, catalogBossArtV2 } from "./bossV2Catalog";

describe("v2 boss art", () => {
  test("all named major encounters use distinct original v2 art", () => {
    expect(catalogBossArtV2("enemies", "minibossNullKnight").source).toContain("miniboss-null-knight.svg");
    expect(catalogBossArtV2("enemies", "bossCacheColossus").source).toContain("boss-cache-colossus.svg");
    expect(catalogBossArtV2("enemies", "bossFluxSovereign").source).toContain("boss-flux-sovereign.svg");
    expect(catalogBossArtV2("enemies", "bossRootWarden").source).toContain("boss-root-warden.svg");
  });

  test("legacy boss aliases stay visually compatible", () => {
    expect(BOSS_V2_CATALOG.knight.source).toBe(BOSS_V2_CATALOG.minibossNullKnight.source);
    expect(BOSS_V2_CATALOG.boss.source).toBe(BOSS_V2_CATALOG.bossCacheColossus.source);
    expect(BOSS_V2_CATALOG.mage.source).toBe(BOSS_V2_CATALOG.bossFluxSovereign.source);
  });

  test("boss art does not intercept non-enemy categories", () => {
    expect(catalogBossArtV2("props", "bossCacheColossus")).toBeNull();
    expect(catalogBossArtV2("enemies", "unknown")).toBeNull();
  });
});