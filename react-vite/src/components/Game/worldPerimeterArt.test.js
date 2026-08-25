import { jest } from "@jest/globals";

jest.unstable_mockModule("./rooms/roomRegistry", () => ({
  editableRoomAt: (mapId, roomX, roomY) => (
    mapId === "overworld" && roomX === 1 && roomY === 1 ? { walls: ["authored"] } : undefined
  ),
}));

const {
  generatedPerimeterCellAt,
  perimeterFamilyFor,
  perimeterMaskAt,
  worldPerimeterArtAt,
} = await import("./worldPerimeterArt");

describe("world-scale perimeter topology", () => {
  test("builds real corner and straight-run masks instead of random prop sequences", () => {
    expect(perimeterMaskAt(0, 0, 0, 0)).toBe(6); // east + south: top-left corner
    expect(perimeterMaskAt(0, 0, 5, 0)).toBe(10); // east + west: horizontal run
    expect(perimeterMaskAt(0, 0, 0, 3)).toBe(5); // north + south: vertical run
    expect(perimeterMaskAt(0, 0, 15, 9)).toBe(9); // north + west: bottom-right corner
  });

  test("door openings remove border cells and create connected doorway caps", () => {
    // Room 1,0 has a south exit at local x 7/8.
    expect(generatedPerimeterCellAt(1, 0, 7, 9)).toBe(false);
    expect(generatedPerimeterCellAt(1, 0, 8, 9)).toBe(false);
    expect(perimeterMaskAt(1, 0, 6, 9)).toBe(8); // west-only cap beside opening
    expect(perimeterMaskAt(1, 0, 9, 9)).toBe(2); // east-only cap beside opening
  });

  test("selects connected art families by world biome", () => {
    expect(perimeterFamilyFor(0, 0)).toBe("forestCliff");
    expect(perimeterFamilyFor(10, 10)).toBe("desertCliff");
    expect(perimeterFamilyFor(12, 2)).toBe("coastShore");
    expect(perimeterFamilyFor(8, 13)).toBe("crystalWall");
    expect(perimeterFamilyFor(8, 1)).toBe("caveWall");
  });

  test("returns topology-specific autotile art ids across the generated world", () => {
    expect(worldPerimeterArtAt("overworld", 0, 0)).toBe("autotile:forestCliff:6");
    expect(worldPerimeterArtAt("overworld", 5, 0)).toBe("autotile:forestCliff:10");
    expect(worldPerimeterArtAt("d01", 0, 0)).toBeNull();
  });

  test("never overrides explicit authored room wall grids", () => {
    expect(worldPerimeterArtAt("overworld", 16, 10)).toBeNull();
    expect(perimeterMaskAt(1, 1, 0, 0)).toBeNull();
  });
});
