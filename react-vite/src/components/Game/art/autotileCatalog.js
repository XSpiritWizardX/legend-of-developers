const SHEETS = Object.freeze({
  forestGround: "/art/tiles/forest-ground-autotiles.png",
  forestPath: "/art/tiles/forest-path-autotiles.png",
  forestCliff: "/art/tiles/forest-cliff-autotiles.png",
  rootboundFloor: "/art/tiles/rootbound-floor-autotiles.png",
  rootboundWall: "/art/tiles/rootbound-wall-autotiles.png",
  desertSand: "/art/tiles/desert-sand-autotiles.svg",
  desertCracked: "/art/tiles/desert-cracked-autotiles.svg",
  desertCliff: "/art/tiles/desert-cliff-autotiles.svg",
  desertDune: "/art/tiles/desert-dune-autotiles.svg",
  coastShore: "/art/tiles/coast-shore-autotiles.svg",
  openWater: "/art/tiles/open-water-autotiles.svg",
  shallowWater: "/art/tiles/shallow-water-autotiles.svg",
  caveFloor: "/art/tiles/cave-floor-autotiles.svg",
  caveWall: "/art/tiles/cave-wall-autotiles.svg",
  crystalFloor: "/art/tiles/crystal-floor-autotiles.svg",
  crystalWall: "/art/tiles/crystal-wall-autotiles.svg",
});

export function autotileArtId(family, mask) {
  return family && Number.isInteger(mask) ? `autotile:${family}:${mask & 15}` : null;
}

export function catalogAutotileArt(category, id) {
  if (category !== "tiles" || typeof id !== "string" || !id.startsWith("autotile:")) return null;
  const [, family, maskValue] = id.split(":");
  const source = SHEETS[family];
  const mask = Number(maskValue);
  if (!source || !Number.isInteger(mask) || mask < 0 || mask > 15) return null;
  return {
    source,
    sourceRect: {
      x: (mask % 4) * 64,
      y: Math.floor(mask / 4) * 64,
      width: 64,
      height: 64,
    },
  };
}
