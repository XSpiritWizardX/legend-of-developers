import {
  EDGE, connectedNeighborMask, familyForCode, maskName, neighborMask, resolveAutotileVariant,
} from "./autotile";

describe("autotile terrain families", () => {
  test("builds deterministic cardinal neighbor masks", () => {
    expect(neighborMask({ north: true, east: true })).toBe(EDGE.N | EDGE.E);
    expect(neighborMask({ south: true, west: true })).toBe(EDGE.S | EDGE.W);
    expect(maskName(EDGE.N | EDGE.E | EDGE.S | EDGE.W)).toBe("nesw");
    expect(maskName(0)).toBe("isolated");
  });

  test("maps authored codes into reusable visual families", () => {
    expect(familyForCode("gr")).toBe("forestGround");
    expect(familyForCode("pt")).toBe("forestPath");
    expect(familyForCode("mw")).toBe("rootboundWall");
    expect(familyForCode("mf")).toBe("rootboundFloor");
    expect(familyForCode("xf")).toBeNull();
  });

  test("derives connectivity from neighboring authored terrain", () => {
    const codes = new Map([
      ["1,1", "gr"], ["1,0", "gr"], ["2,1", "pt"],
      ["1,2", "gr"], ["0,1", "gr"],
    ]);
    const mask = connectedNeighborMask({
      tx: 1,
      ty: 1,
      codeAt: (x, y) => codes.get(`${x},${y}`),
      belongsToFamily: (code) => code === "gr",
    });
    expect(mask).toBe(EDGE.N | EDGE.S | EDGE.W);
  });

  test("resolves numeric and named variants with safe fallback", () => {
    expect(resolveAutotileVariant({ variants: { 3: "corner-ne" }, fallback: "center" }, 3))
      .toBe("corner-ne");
    expect(resolveAutotileVariant({ variants: { ne: "corner-ne" }, fallback: "center" }, 3))
      .toBe("corner-ne");
    expect(resolveAutotileVariant({ fallback: "center" }, 3)).toBe("center");
  });
});
