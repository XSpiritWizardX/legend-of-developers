import { EFFECTS_V2_CATALOG, catalogEffectsArtV2 } from "./effectsV2Catalog";

describe("v2 combat effects", () => {
  test("high-frequency combat effects use v2 art", () => {
    expect(catalogEffectsArtV2("effects", "cssPulse").source).toContain("css-pulse.svg");
    expect(catalogEffectsArtV2("effects", "codeExplosion").source).toContain("code-explosion.svg");
    expect(catalogEffectsArtV2("effects", "rootSurge").source).toContain("root-surge.svg");
  });

  test("elemental bursts share the same visual family", () => {
    expect(EFFECTS_V2_CATALOG.firewallBurst.source).toContain("firewall-burst.svg");
    expect(EFFECTS_V2_CATALOG.freezeBurst.source).toContain("freeze-burst.svg");
  });

  test("effect catalog stays category scoped", () => {
    expect(catalogEffectsArtV2("items", "cssPulse")).toBeNull();
    expect(catalogEffectsArtV2("effects", "unknown")).toBeNull();
  });
});