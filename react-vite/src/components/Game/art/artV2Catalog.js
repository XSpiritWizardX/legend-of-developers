export const ART_V2_CATALOG = {
  tiles: {
    grass: { source: "/art/v2/tiles/grass-a.svg" },
    grassAlt: { source: "/art/v2/tiles/grass-b.svg" },
    village: { source: "/art/v2/tiles/village-path.svg" },
    dirt: { source: "/art/v2/tiles/village-path.svg" },
    pt: { source: "/art/v2/tiles/village-path.svg" },
    forest: { source: "/art/v2/tiles/forest-cliff.svg" },
    forestWall: { source: "/art/v2/tiles/forest-cliff.svg" },
    mountain: { source: "/art/v2/tiles/forest-cliff.svg" },
    cf: { source: "/art/v2/tiles/forest-cliff.svg" },
    stone: { source: "/art/v2/tiles/stone-floor.svg" },
    stoneAlt: { source: "/art/v2/tiles/stone-floor.svg" },
    dungeonFloor: { source: "/art/v2/tiles/cave-floor.svg" },
    dungeonFloorAlt: { source: "/art/v2/tiles/cave-floor-alt.svg" },
    cv: { source: "/art/v2/tiles/cave-floor.svg" },
    wall: { source: "/art/v2/tiles/cave-wall.svg" },
    cw: { source: "/art/v2/tiles/cave-wall.svg" },
    crackedWall: { source: "/art/v2/tiles/cave-wall.svg" },
    ledgeDown: { source: "/art/v2/tiles/ledge-down.svg" },
    le: { source: "/art/v2/tiles/ledge-down.svg" },
    stairs: { source: "/art/v2/tiles/stone-stairs.svg" },
    ss: { source: "/art/v2/tiles/stone-stairs.svg" },
    pit: { source: "/art/v2/tiles/pit.svg" },
    cp: { source: "/art/v2/tiles/pit.svg" },
  },
  props: {
    forestTree: {
      source: "/art/v2/props/forest-tree.svg",
      width: 96,
      height: 112,
      offsetX: -16,
      offsetY: -48,
    },
    forestBush: {
      source: "/art/v2/props/forest-bush.svg",
      width: 72,
      height: 56,
      offsetX: -4,
      offsetY: 8,
    },
    forestTallGrass: { source: "/art/v2/props/tall-grass.svg" },
  },
};

export function catalogArtV2(category, id) {
  return ART_V2_CATALOG[category]?.[id] || null;
}
