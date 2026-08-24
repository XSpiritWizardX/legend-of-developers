import { jest } from "@jest/globals";
import { TERRAIN } from "./terrainInteractions";

jest.unstable_mockModule("./rooms/roomRegistry", () => ({
  editableRoomAt: (mapId, roomX, roomY) => (
    mapId === "overworld" && roomX === 1 && roomY === 1
      ? { walls: ["authored"] }
      : undefined
  ),
}));

const { showcaseTerrainAt, WILLOWBROOK_SHOWCASE } = await import("./showcaseTerrain");

const SOLID_PERIMETER_TILES = new Set([
  "forestWall", "forest", "mountain", "water", "wall", "crackedWall", "house",
]);

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

  test("generated forest perimeter mixes solid environmental materials", () => {
    const topEdge = Array.from({ length: 16 }, (_, x) => showcaseTerrainAt("overworld", x, 0));
    const materials = new Set(topEdge.filter(Boolean));
    expect(materials.size).toBeGreaterThan(1);
    expect([...materials].every((tile) => SOLID_PERIMETER_TILES.has(tile))).toBe(true);
  });

  test("generated desert perimeter uses ruin and cliff materials instead of tree rows", () => {
    const roomX = 10;
    const roomY = 10;
    const y = roomY * 10;
    const edge = Array.from({ length: 16 }, (_, localX) => (
      showcaseTerrainAt("overworld", roomX * 16 + localX, y)
    )).filter(Boolean);
    expect(edge.some((tile) => tile === "wall" || tile === "crackedWall")).toBe(true);
    expect(edge.includes("forestWall")).toBe(false);
  });

  test("generated coast/lake perimeter can blend rock, vegetation and water while staying solid", () => {
    const roomX = 12;
    const roomY = 2;
    const y = roomY * 10;
    const edge = Array.from({ length: 16 }, (_, localX) => (
      showcaseTerrainAt("overworld", roomX * 16 + localX, y)
    )).filter(Boolean);
    expect(new Set(edge).size).toBeGreaterThan(1);
    expect(edge.every((tile) => SOLID_PERIMETER_TILES.has(tile))).toBe(true);
  });

  test("authored room files retain their own custom perimeter art", () => {
    expect(showcaseTerrainAt("overworld", 16, 10)).toBeNull();
  });

  test("showcase terrain never leaks into dungeons", () => {
    expect(showcaseTerrainAt("d01", 22, 18)).toBeNull();
  });
});
