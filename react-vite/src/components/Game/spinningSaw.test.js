import {
  SPINNING_SAW_ART,
  SPINNING_SAW_TYPE,
  catalogSpinningSawArt,
  installSpinningSawSpawns,
  spinningSawDefinitions,
} from "./spinningSaw";

describe("spinning saw enemy", () => {
  test("uses the committed enemy artwork and a fast rotation speed", () => {
    expect(SPINNING_SAW_TYPE).toBe("spinning-saw");
    expect(SPINNING_SAW_ART.source).toBe("/art/enemies/spinning-saw.png.png");
    expect(SPINNING_SAW_ART.width).toBe(64);
    expect(SPINNING_SAW_ART.height).toBe(64);
    expect(SPINNING_SAW_ART.rotationSpeed).toBeGreaterThan(Math.PI * 2);
    expect(catalogSpinningSawArt("enemies", SPINNING_SAW_TYPE)).toBe(SPINNING_SAW_ART);
  });

  test("places recurring saw encounters across the overworld but not safe opening rooms", () => {
    const definitions = spinningSawDefinitions();
    const ids = definitions.map(([id]) => id);

    expect(definitions.length).toBeGreaterThan(20);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).not.toContain("periodic-saw-1-0");
    expect(ids).not.toContain("periodic-saw-1-1");
    expect(ids).not.toContain("periodic-saw-5-3");
    expect(definitions.every(([, type]) => type === SPINNING_SAW_TYPE)).toBe(true);
  });

  test("spawn installation is idempotent", () => {
    const maps = { overworld: { enemies: [["existing", "forestByteBeetle", 4, 4]] } };
    const first = installSpinningSawSpawns(maps);
    const second = installSpinningSawSpawns(maps);

    expect(first).toBeGreaterThan(20);
    expect(second).toBe(0);
    expect(maps.overworld.enemies.filter(([, type]) => type === SPINNING_SAW_TYPE)).toHaveLength(first);
  });
});
