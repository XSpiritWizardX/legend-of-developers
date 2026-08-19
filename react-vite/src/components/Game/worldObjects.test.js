import {
  WORLD_OBJECT_KIND,
  activeWorldObjects,
  breakableBySword,
  canLiftWorldObject,
  facingWorldObject,
  moveWorldObject,
  pushDestination,
  removeWorldObject,
  worldObjectAtPoint,
} from "./worldObjects";

describe("contextual world objects", () => {
  test("places visible interaction props around Willowbrook spawn", () => {
    const objects = activeWorldObjects("overworld", {});
    expect(objects.some((object) => object.kind === WORLD_OBJECT_KIND.POT)).toBe(true);
    expect(objects.some((object) => object.kind === WORLD_OBJECT_KIND.ROCK)).toBe(true);
    expect(objects.some((object) => object.kind === WORLD_OBJECT_KIND.BRUSH)).toBe(true);
  });

  test("removed and moved objects are represented entirely by save flags", () => {
    const flags = {};
    moveWorldObject(flags, "willow-rock", 30, 17);
    let rock = activeWorldObjects("overworld", flags).find((object) => object.id === "willow-rock");
    expect(rock.tx).toBe(30);

    removeWorldObject(flags, "willow-rock");
    rock = activeWorldObjects("overworld", flags).find((object) => object.id === "willow-rock");
    expect(rock).toBeUndefined();
  });

  test("facing interaction chooses the object in front instead of radial proximity", () => {
    const objects = activeWorldObjects("overworld", {});
    const object = facingWorldObject({
      objects,
      player: { x: 22 * 64 + 32, y: 16 * 64 + 32 },
      direction: "down",
      distance: 64,
      radius: 34,
    });
    expect(object?.id).toBe("willow-pot-west");
  });

  test("pots lift immediately while the heavy rock requires the glove", () => {
    const objects = activeWorldObjects("overworld", {});
    const pot = objects.find((object) => object.kind === WORLD_OBJECT_KIND.POT);
    const rock = objects.find((object) => object.kind === WORLD_OBJECT_KIND.ROCK);
    expect(canLiftWorldObject(pot, {})).toBe(true);
    expect(canLiftWorldObject(rock, {})).toBe(false);
    expect(canLiftWorldObject(rock, { glove: true })).toBe(true);
  });

  test("push destinations are tile aligned and collisions are queryable", () => {
    const objects = activeWorldObjects("overworld", {});
    const rock = objects.find((object) => object.id === "willow-rock");
    expect(pushDestination(rock, "right")).toEqual({ tx: 30, ty: 17 });
    expect(worldObjectAtPoint(objects, rock.x, rock.y)?.id).toBe("willow-rock");
  });

  test("brush and fragile pots can be cleared by sword attacks", () => {
    const objects = activeWorldObjects("overworld", {});
    expect(breakableBySword(objects.find((object) => object.kind === WORLD_OBJECT_KIND.BRUSH))).toBe(true);
    expect(breakableBySword(objects.find((object) => object.kind === WORLD_OBJECT_KIND.POT))).toBe(true);
    expect(breakableBySword(objects.find((object) => object.kind === WORLD_OBJECT_KIND.ROCK))).toBe(false);
  });
});
