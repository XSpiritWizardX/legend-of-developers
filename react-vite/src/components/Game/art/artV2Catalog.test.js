import { ART_V2_CATALOG, catalogArtV2 } from "./artV2Catalog";

describe("v2 game art overrides", () => {
  test("starting terrain uses one cohesive art family", () => {
    expect(catalogArtV2("tiles", "grass").source).toBe("/art/v2/tiles/grass-a.svg");
    expect(catalogArtV2("tiles", "village").source).toBe("/art/v2/tiles/village-path.svg");
    expect(catalogArtV2("tiles", "forestWall").source).toBe("/art/v2/tiles/forest-cliff.svg");
    expect(catalogArtV2("tiles", "ledgeDown").source).toBe("/art/v2/tiles/ledge-down.svg");
    expect(catalogArtV2("tiles", "stairs").source).toBe("/art/v2/tiles/stone-stairs.svg");
  });

  test("Willowbrook buildings, props and villagers no longer fall back to legacy art", () => {
    expect(catalogArtV2("buildings", "villageHouse").source).toContain("village-house.svg");
    expect(catalogArtV2("buildings", "villageShop").source).toContain("village-shop.svg");
    expect(catalogArtV2("props", "villageWell").source).toContain("village-well.svg");
    expect(catalogArtV2("props", "villageSign").source).toContain("village-sign.svg");
    expect(catalogArtV2("props", "villageLamp").source).toContain("village-lamp.svg");
    expect(catalogArtV2("props", "villageFence").source).toContain("village-fence.svg");
    expect(catalogArtV2("props", "bridgeVertical").source).toContain("bridge-vertical.svg");
    expect(catalogArtV2("props", "forestFlowers").source).toContain("forest-flowers.svg");
    expect(catalogArtV2("props", "forestMushrooms").source).toContain("forest-mushrooms.svg");
    expect(catalogArtV2("characters", "villagerGardener").source).toContain("villager-gardener.svg");
    expect(catalogArtV2("characters", "villagerMechanic").source).toContain("villager-mechanic.svg");
  });

  test("Willowbrook Hollow shares the same v2 cave family", () => {
    expect(catalogArtV2("tiles", "dungeonFloor").source).toBe("/art/v2/tiles/cave-floor.svg");
    expect(catalogArtV2("tiles", "dungeonFloorAlt").source).toBe("/art/v2/tiles/cave-floor-alt.svg");
    expect(catalogArtV2("tiles", "wall").source).toBe("/art/v2/tiles/cave-wall.svg");
    expect(catalogArtV2("tiles", "pit").source).toBe("/art/v2/tiles/pit.svg");
    expect(catalogArtV2("props", "caveStalagmite").source).toContain("cave-stalagmite.svg");
    expect(catalogArtV2("props", "caveBones").source).toContain("cave-bones.svg");
    expect(catalogArtV2("props", "caveTorch").source).toContain("cave-torch.svg");
  });

  test("water and desert biomes use v2 terrain and scenery instead of legacy PNGs", () => {
    expect(catalogArtV2("tiles", "water").frames).toHaveLength(2);
    expect(catalogArtV2("tiles", "deepWater").source).toContain("deep-water.svg");
    expect(catalogArtV2("tiles", "sw").source).toContain("shallow-water.svg");
    expect(catalogArtV2("tiles", "desert").source).toContain("desert-sand.svg");
    expect(catalogArtV2("tiles", "desertAlt").source).toContain("desert-cracked.svg");
    expect(catalogArtV2("tiles", "dc").source).toContain("desert-cliff.svg");
    expect(catalogArtV2("props", "desertCactus").source).toContain("desert-cactus.svg");
    expect(catalogArtV2("props", "desertDryBush").source).toContain("desert-dry-bush.svg");
    expect(catalogArtV2("props", "desertRock").source).toContain("desert-rock.svg");
  });

  test("early combat silhouettes are animated on the v2 enemy family", () => {
    const expected = {
      forestByteBeetle: "forest-byte-beetle.svg",
      caveEchoBat: "cave-echo-bat.svg",
      waterCurrentBlob: "water-current-blob.svg",
      dungeonFirewallDrone: "dungeon-firewall-drone.svg",
      desertSandSkitter: "desert-sand-skitter.svg",
    };
    Object.entries(expected).forEach(([id, firstFrame]) => {
      const entry = catalogArtV2("enemies", id);
      expect(entry.frames).toHaveLength(2);
      expect(entry.frames[0]).toContain(firstFrame);
      expect(entry.frameDuration).toBeGreaterThan(0);
    });
  });

  test("common dungeon interactables use the v2 prop family", () => {
    expect(catalogArtV2("props", "dungeonChest").source).toContain("dungeon-chest.svg");
    expect(catalogArtV2("props", "dungeonPot").source).toContain("dungeon-pot.svg");
    expect(catalogArtV2("props", "dungeonCrate").source).toContain("dungeon-crate.svg");
  });

  test("liftable and breakable field objects use matching v2 art", () => {
    expect(catalogArtV2("props", "worldPot").source).toContain("world-pot.svg");
    expect(catalogArtV2("props", "worldRock").source).toContain("world-rock.svg");
    expect(catalogArtV2("props", "worldBrush").source).toContain("world-brush.svg");
  });

  test("player walk art is an original four-direction v2 sprite sheet", () => {
    const playerWalk = catalogArtV2("characters", "playerWalk");
    expect(playerWalk.source).toBe("/art/v2/characters/player-walk-sheet.svg");
    expect(playerWalk.sheet.framesPerDirection).toBe(4);
    expect(playerWalk.sheet.directions).toEqual(["down", "left", "right", "up"]);
    expect(playerWalk.sheet.frameWidth).toBe(64);
    expect(playerWalk.sheet.frameHeight).toBe(64);
  });

  test("v2 stays opt-in so unfinished categories still have legacy fallback", () => {
    expect(ART_V2_CATALOG.props.forestTree.source).toContain("/art/v2/props/");
    expect(catalogArtV2("props", "forestBush").source).toContain("forest-bush.svg");
    expect(catalogArtV2("items", "htmlSword")).toBeNull();
  });
});
