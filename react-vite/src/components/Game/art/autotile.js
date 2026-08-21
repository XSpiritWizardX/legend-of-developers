export const EDGE = Object.freeze({
  N: 1,
  E: 2,
  S: 4,
  W: 8,
});

export function neighborMask({ north = false, east = false, south = false, west = false } = {}) {
  return (north ? EDGE.N : 0)
    | (east ? EDGE.E : 0)
    | (south ? EDGE.S : 0)
    | (west ? EDGE.W : 0);
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
  return variants[mask]
    || variants[maskName(mask)]
    || family.fallback
    || family.center
    || null;
}

export function connectedNeighborMask({ tx, ty, codeAt, belongsToFamily }) {
  if (typeof codeAt !== "function" || typeof belongsToFamily !== "function") return 0;
  return neighborMask({
    north: belongsToFamily(codeAt(tx, ty - 1)),
    east: belongsToFamily(codeAt(tx + 1, ty)),
    south: belongsToFamily(codeAt(tx, ty + 1)),
    west: belongsToFamily(codeAt(tx - 1, ty)),
  });
}

// These families intentionally separate gameplay meaning from artwork choice.
// Rooms still author compact tile codes; the resolver chooses the visual edge,
// corner, or center variant from neighboring terrain.
export const AUTOTILE_FAMILIES = Object.freeze({
  forestGround: Object.freeze({
    codes: Object.freeze(["g", "gr", "fl", "ms", "tg"]),
    center: "gr",
    fallback: "gr",
  }),
  forestPath: Object.freeze({
    codes: Object.freeze(["p", "pt"]),
    center: "pt",
    fallback: "pt",
  }),
  forestCliff: Object.freeze({
    codes: Object.freeze(["T", "R", "tr", "rk", "cf", "le"]),
    center: "cf",
    fallback: "cf",
  }),
  rootboundFloor: Object.freeze({
    codes: Object.freeze(["f", "m", "mf", "xf"]),
    center: "mf",
    fallback: "mf",
  }),
  rootboundWall: Object.freeze({
    codes: Object.freeze(["#", "##", "mw", "xw"]),
    center: "mw",
    fallback: "mw",
  }),
});

export function familyForCode(code) {
  return Object.entries(AUTOTILE_FAMILIES).find(([, family]) => family.codes.includes(code))?.[0] || null;
}
