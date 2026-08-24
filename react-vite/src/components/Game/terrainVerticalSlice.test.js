import { showcaseTerrainAt } from "./showcaseTerrain";
import {
  ELEVATION_TRANSITION,
  TERRAIN,
  elevationAllowsMovement,
  elevationTransitionFor,
} from "./terrainInteractions";
import {
  WORLD_OBJECT_KIND,
  activeWorldObjects,
  canLiftWorldObject,
  facingWorldObject,
  pushDestination,
} from "./worldObjects";

const TILE = 64;
const playerAt = (tx, ty, dir = "down") => ({
  x: tx * TILE + TILE / 2,
  y: ty * TILE + TILE / 2,
  dir,
});

describe("Willowbrook expressive terrain vertical slice", () => {
  test("the authored showcase includes cliff drop, stairs, ramp and pits", () => {
    expect(showcaseTerrainAt("overworld", 22, 18)).toBe(TERRAIN.LEDGE_DOWN);
    expect(showcaseTerrainAt("overworld", 27, 18)).toBe(TERRAIN.STAIRS);
    expect(showcaseTerrainAt("overworld", 29, 18)).toBe(TERRAIN.RAMP);
    expect(showcaseTerrainAt("overworld", 21, 22)).toBe(TERRAIN.PIT);
  });

  test("stairs and ramps are the only authored elevation-change routes", () => {
    expect(elevationTransitionFor({ tile: TERRAIN.STAIRS, direction: "up" }))
      .toBe(ELEVATION_TRANSITION.ASCEND);
    expect(elevationAllowsMovement({
      fromElevation: 0,
      toElevation: 1,
      tile: TERRAIN.RAMP,
      direction: "up",
    })).toBe(true);
    expect(elevationAllowsMovement({
      fromElevation: 0,
      toElevation: 1,
      tile: "stone",
      direction: "up",
    })).toBe(false);
  });

  test("the same room exposes facing-based pot, rock and brush interactions", () => {
    const objects = activeWorldObjects("overworld", {}, TILE);
    expect(objects.some((object) => object.kind === WORLD_OBJECT_KIND.POT)).toBe(true);
    expect(objects.some((object) => object.kind === WORLD_OBJECT_KIND.ROCK)).toBe(true);
    expect(objects.some((object) => object.kind === WORLD_OBJECT_KIND.BRUSH)).toBe(true);

    const westPot = objects.find((object) => object.id === "willow-pot-west");
    const player = {
      ...playerAt(22, 18, "up"),
      x: westPot.x,
      y: westPot.y + 42,
    };
    expect(facingWorldObject({ objects, player, direction: "up", distance: 42, radius: 32 })?.id)
      .toBe("willow-pot-west");
  });

  test("rock manipulation remains equipment-sensitive and deterministic", () => {
    const rock = activeWorldObjects("overworld", {}, TILE)
      .find((object) => object.id === "willow-rock");
    expect(canLiftWorldObject(rock, {})).toBe(false);
    expect(canLiftWorldObject(rock, { glove: true })).toBe(true);
    expect(pushDestination(rock, "left")).toEqual({ tx: 28, ty: 17 });
  });
});
