import { PROP_SCENERY, TILE_SCENERY, catalogSceneryArtV2 } from "./sceneryV2Catalog";

describe("v2 coast and dungeon scenery", () => {
  test("coast tile aliases use the v2 family", () => {
    ["sh", "fm", "re", "dk", "bt", "wf", "ly", "co"].forEach((id) => {
      expect(catalogSceneryArtV2("tiles", id)?.source).toMatch(/^\/art\/v2\//);
    });
  });

  test("authored coast props map to the same assets as tile aliases", () => {
    expect(PROP_SCENERY.coastDock.source).toBe(TILE_SCENERY.dk.source);
    expect(PROP_SCENERY.coastBoat.source).toBe(TILE_SCENERY.bt.source);
    expect(PROP_SCENERY.coastWaterfall.source).toBe(TILE_SCENERY.wf.source);
    expect(PROP_SCENERY.coastCoral.source).toBe(TILE_SCENERY.co.source);
  });

  test("dungeon tile aliases no longer fall back to legacy art", () => {
    ["lockedDoor", "barrier", "switch", "dd", "dl", "eb", "ps", "gs", "pi", "tm", "tp", "dn", "pg"].forEach((id) => {
      expect(catalogSceneryArtV2("tiles", id)?.source).toMatch(/^\/art\/v2\/props\//);
    });
  });

  test("authored dungeon props use the same v2 architecture family", () => {
    [
      "dungeonDoor", "dungeonLockedDoor", "dungeonBarrier", "dungeonSwitch", "dungeonStatue",
      "dungeonPillar", "dungeonTerminal", "dungeonSpikeTrap", "dungeonStairs", "dungeonPortal",
    ].forEach((id) => {
      expect(catalogSceneryArtV2("props", id)?.source).toMatch(/^\/art\/v2\/props\//);
    });
  });

  test("scenery catalog stays scoped", () => {
    expect(catalogSceneryArtV2("characters", "dungeonDoor")).toBeNull();
    expect(catalogSceneryArtV2("props", "unknown")).toBeNull();
  });
});