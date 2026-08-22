import { autotileArtId } from "./autotileCatalog";

export const EDGE = Object.freeze({ N: 1, E: 2, S: 4, W: 8 });

export function neighborMask({ north = false, east = false, south = false, west = false } = {}) {
  return (north ? EDGE.N : 0) | (east ? EDGE.E : 0) | (south ? EDGE.S : 0) | (west ? EDGE.W : 0);
}

export function maskName(mask) {
  const names = [];
  if (mask & EDGE.N) names.push("n");
  if (mask & EDGE.E) names.push("e");
  if (mask & EDGE.S) names.push("s");
  if (mask & EDGE.W) names.push("w");
  return names.length ? names.join("") : "isolated";
}

export function resolveAutotileVariant(family, mask) {
  if (!family) return null;
  const variants = family.variants || {};
  return variants[mask] || variants[maskName(mask)] || family.fallback || family.center || null;
}

export function connectedNeighborMask({ tx, ty, codeAt, belongsToFamily }) {
  if (typeof codeAt !== "function" || typeof belongsToFamily !== "function") return 0;
  return neighborMask({
    north: belongsToFamily(codeAt(tx, ty - 1)), east: belongsToFamily(codeAt(tx + 1, ty)),
    south: belongsToFamily(codeAt(tx, ty + 1)), west: belongsToFamily(codeAt(tx - 1, ty)),
  });
}

function variantsFor(family) {
  return Object.freeze(Object.fromEntries(Array.from({ length: 16 }, (_, mask) => [mask, autotileArtId(family, mask)])));
}

function family(codes, id, fallback) {
  return Object.freeze({ codes: Object.freeze(codes), variants: variantsFor(id), center: autotileArtId(id, 15), fallback });
}

export const AUTOTILE_FAMILIES = Object.freeze({
  forestGround: family(["g", "gr"], "forestGround", "gr"),
  forestPath: family(["p", "pt"], "forestPath", "pt"),
  forestCliff: family(["cf"], "forestCliff", "cf"),
  rootboundFloor: family(["f", "mf"], "rootboundFloor", "mf"),
  rootboundWall: family(["#", "##", "mw"], "rootboundWall", "mw"),
  desertSand: family(["desert", "dt", "ds"], "desertSand", "ds"),
  desertCracked: family(["desertAlt", "sa", "ck"], "desertCracked", "ck"),
  desertCliff: family(["dc"], "desertCliff", "dc"),
  desertDune: family(["du"], "desertDune", "du"),
  coastShore: family(["sh"], "coastShore", "sh"),
  openWater: family(["water", "dw", "ow"], "openWater", "ow"),
  shallowWater: family(["sw"], "shallowWater", "sw"),
  caveFloor: family(["stone", "dungeonFloor", "dungeonFloorAlt", "cv"], "caveFloor", "cv"),
  caveWall: family(["wall", "crackedWall", "cw"], "caveWall", "cw"),
  cavePit: family(["cp"], "cavePit", "cp"),
  crystalFloor: family(["xf"], "crystalFloor", "xf"),
  crystalWall: family(["xw"], "crystalWall", "xw"),
  reactorFloor: family(["rf"], "reactorFloor", "rf"),
  reactorWall: family(["rw"], "reactorWall", "rw"),
  reactorMolten: family(["rm"], "reactorMolten", "rm"),
  serverCoreFloor: family(["sf"], "serverCoreFloor", "sf"),
  serverCoreWall: family(["sv"], "serverCoreWall", "sv"),
  serverCoolant: family(["sc"], "serverCoolant", "sc"),
});

export function familyForCode(code) {
  return Object.entries(AUTOTILE_FAMILIES).find(([, entry]) => entry.codes.includes(code))?.[0] || null;
}
