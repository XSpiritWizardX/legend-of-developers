import { WORLD_OBJECT_KIND } from "./worldObjects";
import { worldObjectArtFor, worldObjectDrawBox } from "./worldObjectArt";

describe("world object v2 art", () => {
  test("maps every interactive Willowbrook object kind to a v2 prop", () => {
    expect(worldObjectArtFor(WORLD_OBJECT_KIND.POT).id).toBe("worldPot");
    expect(worldObjectArtFor(WORLD_OBJECT_KIND.ROCK).id).toBe("worldRock");
    expect(worldObjectArtFor(WORLD_OBJECT_KIND.BRUSH).id).toBe("worldBrush");
  });

  test("centers object art around the world anchor", () => {
    expect(worldObjectDrawBox(WORLD_OBJECT_KIND.POT, 100, 200)).toEqual({
      id: "worldPot",
      x: 68,
      y: 146,
      width: 64,
      height: 72,
    });
  });

  test("carried objects render slightly higher above the player", () => {
    const ground = worldObjectDrawBox(WORLD_OBJECT_KIND.ROCK, 100, 200);
    const carried = worldObjectDrawBox(WORLD_OBJECT_KIND.ROCK, 100, 200, { carried: true });
    expect(carried.y).toBe(ground.y - 8);
  });

  test("unknown kinds gracefully keep the engine fallback available", () => {
    expect(worldObjectArtFor("unknown")).toBeNull();
    expect(worldObjectDrawBox("unknown", 0, 0)).toBeNull();
  });
});