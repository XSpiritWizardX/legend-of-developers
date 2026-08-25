import { jest } from "@jest/globals";
import { TERRAIN } from "./terrainInteractions";

jest.unstable_mockModule("./rooms/roomRegistry", () => ({
  editableRoomAt: (mapId, roomX, roomY) => (
    mapId === "overworld" && roomX === 1 && roomY === 1
      ? { walls: ["authored"] }
      : undefined
  ),
}));

const { showcaseArtAt, showcaseTerrainAt, WILLOWBROOK_SHOWCASE } = await import("./showcaseTerrain");

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

  test("generated perimeter art now resolves connected corner and wall-run assets", () => {
    expect(showcaseArtAt("overworld", 0, 0)).toBe("autotile:forestCliff:6");
    expect(showcaseArtAt("overworld", 5, 0)).toBe("autotile:forestCliff:10");
  });

  test("authored room files keep their own custom perimeter art", () => {
    expect(showcaseArtAt("overworld", 16, 10)).toBeNull();
  });

  test("showcase terrain and perimeter art never leak into dungeons", () => {
    expect(showcaseTerrainAt("d01", 22, 18)).toBeNull();
    expect(showcaseArtAt("d01", 0, 0)).toBeNull();
  });
});
