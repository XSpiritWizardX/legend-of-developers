import { describe, expect, test } from "vitest";
import {
  FAST_TRAVEL_DESTINATIONS,
  buildFastTravelSave,
  fastTravelDestination,
  isOverworldFastTravelActivation,
  resolveFastTravelPoint,
  withFastTravelMirror,
} from "./fastTravel";

describe("Returning Mirror overworld fast travel", () => {
  test("grants the mirror without discarding existing save state", () => {
    const original = {
      version: 3,
      mapId: "overworld",
      flags: { firstWebpage: true },
      discovered: { "overworld:1,1": true },
      player: {
        hp: 5,
        coins: 77,
        equippedSlots: ["bow", "boomerang"],
        inventory: { htmlSword: true, bow: true, maps: { d01: true } },
      },
    };

    const next = withFastTravelMirror(original);

    expect(next.player.inventory).toMatchObject({
      htmlSword: true,
      bow: true,
      mirror: true,
      maps: { d01: true },
    });
    expect(next.player.hp).toBe(5);
    expect(next.player.coins).toBe(77);
    expect(next.player.equippedSlots).toEqual(["bow", "boomerang"]);
    expect(next.flags).toEqual({ firstWebpage: true });
    expect(next.discovered).toEqual({ "overworld:1,1": true });
  });

  test("only treats an equipped mirror as fast travel while in the overworld", () => {
    const save = {
      mapId: "overworld",
      player: {
        inventory: { mirror: true, bow: true },
        equippedSlots: ["mirror", "bow"],
      },
    };

    expect(isOverworldFastTravelActivation(save, "j")).toBe(true);
    expect(isOverworldFastTravelActivation(save, "k")).toBe(false);
    expect(isOverworldFastTravelActivation({ ...save, mapId: "d01" }, "j")).toBe(false);
    expect(isOverworldFastTravelActivation({
      ...save,
      player: { ...save.player, inventory: { mirror: false } },
    }, "j")).toBe(false);
  });

  test("moves to a safe named destination while preserving progression data", () => {
    const save = {
      version: 3,
      mapId: "overworld",
      flags: { firstWebpage: true, reactApp: true },
      discovered: { "overworld:1,1": true },
      openedChests: { "ow-html-sword": true },
      player: {
        x: 120,
        y: 120,
        dir: "left",
        hp: 4,
        maxHp: 8,
        coins: 123,
        keys: 2,
        inventory: { mirror: true, htmlSword: true, bombs: 6 },
        equippedSlots: ["mirror", "bombs"],
      },
    };

    const next = buildFastTravelSave(save, "willowbrook");
    const destination = fastTravelDestination("willowbrook");
    const expectedPoint = resolveFastTravelPoint(destination, save.flags);

    expect(next.mapId).toBe("overworld");
    expect({ x: next.player.x, y: next.player.y }).toEqual(expectedPoint);
    expect(next.player.dir).toBe("down");
    expect(next.player.hp).toBe(4);
    expect(next.player.maxHp).toBe(8);
    expect(next.player.coins).toBe(123);
    expect(next.player.keys).toBe(2);
    expect(next.player.inventory).toMatchObject({ mirror: true, htmlSword: true, bombs: 6 });
    expect(next.player.equippedSlots).toEqual(["mirror", "bombs"]);
    expect(next.flags).toEqual(save.flags);
    expect(next.discovered).toEqual(save.discovered);
    expect(next.openedChests).toEqual(save.openedChests);
  });

  test("ships with the requested town and landmark destinations", () => {
    expect(FAST_TRAVEL_DESTINATIONS.map(({ name }) => name)).toEqual([
      "Willowbrook Village",
      "Hero's Grove",
      "Rosewall Hamlet",
      "Silverwater Gate",
      "Moonstone Keep",
      "Crystalwater Approach",
    ]);
  });
});
