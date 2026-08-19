import { interiorByMapId } from "./interiors";
import { MAPS, TILE, isSolid, tileAt } from "./world";

describe("Willowbrook Hollow world", () => {
  test("map dimensions match the authored 12x8 logical room", () => {
    const hollow = interiorByMapId("willowCave");
    expect(MAPS.willowCave.width).toBe(hollow.size.width);
    expect(MAPS.willowCave.height).toBe(hollow.size.height);
  });

  test("outer cave walls enclose the small room except for its south exit", () => {
    expect(isSolid(tileAt("willowCave", 0, 0))).toBe(true);
    expect(isSolid(tileAt("willowCave", 11, 4))).toBe(true);
    expect(isSolid(tileAt("willowCave", 6, 7))).toBe(false);
  });

  test("spawn is inside open walkable cave floor", () => {
    const tx = Math.floor(MAPS.willowCave.spawn.x / TILE);
    const ty = Math.floor(MAPS.willowCave.spawn.y / TILE);
    expect(["dungeonFloor", "dungeonFloorAlt"]).toContain(tileAt("willowCave", tx, ty));
  });

  test("small room has a reward cache and enemies without using dungeon progression", () => {
    expect(MAPS.willowCave.chests.some(([id]) => id === "willow-cave-cache")).toBe(true);
    expect(MAPS.willowCave.enemies.length).toBeGreaterThan(0);
    expect(MAPS.willowCave.number).toBeUndefined();
  });
});
