import { jest } from "@jest/globals";

jest.unstable_mockModule("./rooms/roomRegistry", () => ({
  editableRoomAt: () => undefined,
}));

const {
  SCREEN_COLS,
  SCREEN_ROWS,
  TILE,
  isSolid,
  roomExitsAt,
  roomNameAt,
  tileAt,
} = await import("./world");

describe("game world functionality", () => {
  test("identifies the room containing the player", () => {
    // A player positioned in overworld room 1,1 should see its authored name and coordinate.
    const x = SCREEN_COLS * TILE + TILE / 2;
    const y = SCREEN_ROWS * TILE + TILE / 2;
    expect(roomNameAt("overworld", x, y)).toBe("Willowbrook Village · 2B");
  });

  test("returns the authored exits for the starting room", () => {
    // Hero's Grove should let the player travel east or south, but not through other edges.
    expect(roomExitsAt("overworld", 1, 0)).toEqual(["e", "s"]);
  });

  test("treats a debug-lab boundary wall as solid", () => {
    // Collision detection should prevent the player from crossing the room's west wall.
    const boundaryTile = tileAt("debugLab", 0, 4);
    expect(boundaryTile).toBe("wall");
    expect(isSolid(boundaryTile)).toBe(true);
  });

  test("allows movement across the debug-lab exit", () => {
    // The two southern doorway tiles are floor and should not block the player.
    const exitTile = tileAt("debugLab", 7, SCREEN_ROWS - 1);
    expect(exitTile).toBe("dungeonFloor");
    expect(isSolid(exitTile)).toBe(false);
  });

  test("marks coordinates outside the map as impassable void", () => {
    // A negative tile coordinate is an edge case that must remain outside the playable world.
    const outsideTile = tileAt("overworld", -1, 0);
    expect(outsideTile).toBe("void");
    expect(isSolid(outsideTile)).toBe(true);
  });
});
