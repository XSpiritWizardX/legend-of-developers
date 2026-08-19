import { ART_V2_CATALOG, catalogArtV2 } from "./artV2Catalog";

describe("v2 game art overrides", () => {
  test("starting terrain uses one cohesive art family", () => {
    expect(catalogArtV2("tiles", "grass").source).toBe("/art/v2/tiles/grass-a.svg");
    expect(catalogArtV2("tiles", "village").source).toBe("/art/v2/tiles/village-path.svg");
    expect(catalogArtV2("tiles", "forestWall").source).toBe("/art/v2/tiles/forest-cliff.svg");
    expect(catalogArtV2("tiles", "ledgeDown").source).toBe("/art/v2/tiles/ledge-down.svg");
    expect(catalogArtV2("tiles", "stairs").source).toBe("/art/v2/tiles/stone-stairs.svg");
  });

  test("Willowbrook Hollow shares the same v2 cave family", () => {
    expect(catalogArtV2("tiles", "dungeonFloor").source).toBe("/art/v2/tiles/cave-floor.svg");
    expect(catalogArtV2("tiles", "dungeonFloorAlt").source).toBe("/art/v2/tiles/cave-floor-alt.svg");
    expect(catalogArtV2("tiles", "wall").source).toBe("/art/v2/tiles/cave-wall.svg");
    expect(catalogArtV2("tiles", "pit").source).toBe("/art/v2/tiles/pit.svg");
  });

  test("vegetation overrides remain explicit and fallbacks stay possible", () => {
    expect(ART_V2_CATALOG.props.forestTree.source).toContain("/art/v2/props/");
    expect(catalogArtV2("props", "forestBush").source).toContain("forest-bush.svg");
    expect(catalogArtV2("items", "htmlSword")).toBeNull();
  });
});