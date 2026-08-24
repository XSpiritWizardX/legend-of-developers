import { TERRAIN } from "./terrainInteractions";
import { showcaseTerrainAt, WILLOWBROOK_SHOWCASE } from "./showcaseTerrain";

describe("visible traversal showcase", () => {
  test("Willowbrook is a 32x20 authored showcase room", () => {
    expect(WILLOWBROOK_SHOWCASE).toEqual({ x: 16, y: 10, width: 32, height: 20 });
  });

  test("old fixed-screen seams are opened inside Willowbrook", () => {
    expect(showcaseTerrainAt("overworld", 31, 12)).toBe("village");
    expect(showcaseTerrainAt("overworld", 32, 27)).toBe("village");
    expect(showcaseTerrainAt("overworld", 18, 19)).toBe("village");
    expect(showcaseTerrainAt("overworld", 46, 20)).toBe("village");
  });

  test("starting terrace has one-way drops plus reversible stair and ramp routes", () => {
    expect(showcaseTerrainAt("overworld", 22, 18)).toBe(TERRAIN.LEDGE_DOWN);
    expect(showcaseTerrainAt("overworld", 27, 18)).toBe(TERRAIN.STAIRS);
    expect(showcaseTerrainAt("overworld", 29, 18)).toBe(TERRAIN.RAMP);
  });

  test("pit garden is close to the starting area but leaves a safe reward path", () => {
    expect(showcaseTerrainAt("overworld", 21, 22)).toBe(TERRAIN.PIT);
    expect(showcaseTerrainAt("overworld", 23, 22)).not.toBe(TERRAIN.PIT);
    expect(showcaseTerrainAt("overworld", 26, 23)).toBe("stone");
  });

  test("showcase terrain never leaks into dungeons", () => {
    expect(showcaseTerrainAt("d01", 22, 18)).toBeNull();
  });
});
