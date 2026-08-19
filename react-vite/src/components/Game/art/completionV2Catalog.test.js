import { COMPLETION_PROPS, COMPLETION_TILES, catalogCompletionArtV2 } from "./completionV2Catalog";

describe("v2 scenery completion", () => {
  test("forest and desert legacy aliases are covered", () => {
    ["sp", "lg", "du", "bn", "ru", "oa"].forEach((id) => {
      expect(catalogCompletionArtV2("tiles", id)?.source).toMatch(/^\/art\/v2\//);
    });
  });

  test("crystal rooms and alternate dungeon aliases use v2 art", () => {
    ["xf", "xw", "xs", "xl", "mf", "mw", "sf", "sv"].forEach((id) => {
      expect(catalogCompletionArtV2("tiles", id)?.source).toMatch(/^\/art\/v2\//);
    });
  });

  test("snow now has explicit v2 terrain", () => {
    expect(COMPLETION_TILES.snow.source).toBe("/art/v2/tiles/snow.svg");
  });

  test("authored props use the same completed scenery family", () => {
    expect(COMPLETION_PROPS.forestStump.source).toBe(COMPLETION_TILES.sp.source);
    expect(COMPLETION_PROPS.forestLog.source).toBe(COMPLETION_TILES.lg.source);
    expect(COMPLETION_PROPS.desertRuins.source).toBe(COMPLETION_TILES.ru.source);
    expect(COMPLETION_PROPS.desertOasis.source).toBe(COMPLETION_TILES.oa.source);
    expect(COMPLETION_PROPS.crystalLarge.source).toBe(COMPLETION_TILES.xl.source);
  });

  test("completion catalog stays scoped", () => {
    expect(catalogCompletionArtV2("characters", "xf")).toBeNull();
    expect(catalogCompletionArtV2("props", "unknown")).toBeNull();
  });
});