const COMPLETION_TILES = Object.freeze({
  sp: Object.freeze({ source: "/art/v2/props/forest-stump.svg", width: 48, height: 48, offsetX: 8, offsetY: 16 }),
  lg: Object.freeze({ source: "/art/v2/props/forest-log.svg", width: 96, height: 48, offsetX: -16, offsetY: 16 }),
  du: Object.freeze({ source: "/art/v2/tiles/desert-dune.svg" }),
  bn: Object.freeze({ source: "/art/v2/props/desert-bones.svg", width: 72, height: 48, offsetX: -4, offsetY: 16 }),
  ru: Object.freeze({ source: "/art/v2/props/desert-ruins.svg", width: 144, height: 144, offsetX: -40, offsetY: -80 }),
  oa: Object.freeze({ source: "/art/v2/props/desert-oasis.svg", width: 160, height: 128, offsetX: -48, offsetY: -64 }),
  xf: Object.freeze({ source: "/art/v2/tiles/crystal-floor.svg" }),
  xw: Object.freeze({ source: "/art/v2/tiles/crystal-wall.svg" }),
  xs: Object.freeze({ source: "/art/v2/props/crystal-small.svg", width: 64, height: 64 }),
  xl: Object.freeze({ source: "/art/v2/props/crystal-large.svg", width: 144, height: 128, offsetX: -40, offsetY: -64 }),
  snow: Object.freeze({ source: "/art/v2/tiles/snow.svg" }),
  mf: Object.freeze({ source: "/art/v2/tiles/cave-floor.svg" }),
  mw: Object.freeze({ source: "/art/v2/tiles/cave-wall.svg" }),
  sf: Object.freeze({ source: "/art/v2/tiles/crystal-floor.svg" }),
  sv: Object.freeze({ source: "/art/v2/tiles/crystal-wall.svg" }),
});

const COMPLETION_PROPS = Object.freeze({
  forestStump: COMPLETION_TILES.sp,
  forestLog: COMPLETION_TILES.lg,
  desertBones: COMPLETION_TILES.bn,
  desertRuins: COMPLETION_TILES.ru,
  desertOasis: COMPLETION_TILES.oa,
  crystalSmall: COMPLETION_TILES.xs,
  crystalLarge: COMPLETION_TILES.xl,
});

export function catalogCompletionArtV2(category, id) {
  if (category === "tiles") return COMPLETION_TILES[id] || null;
  if (category === "props") return COMPLETION_PROPS[id] || null;
  return null;
}

export { COMPLETION_PROPS, COMPLETION_TILES };
