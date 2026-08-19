import { authoredRegionsForMap, authoredRoomsForMap, logicalRoomAtTile } from "./worldLayout";

describe("logical world layout", () => {
  test("models Willowbrook as a larger 32x20 authored settlement", () => {
    const willowbrook = authoredRoomsForMap("overworld")
      .find((room) => room.id === "willowbrook-village");
    expect(willowbrook.bounds).toEqual({ x: 16, y: 10, width: 32, height: 20 });
  });

  test("keeps Hero's Grove as a compact single-screen clearing", () => {
    const room = logicalRoomAtTile("overworld", 24, 4);
    expect(room.id).toBe("heros-grove");
    expect(room.bounds.width).toBe(16);
    expect(room.bounds.height).toBe(10);
  });

  test("can resolve a broad outdoor region when no specific room owns a tile", () => {
    const room = logicalRoomAtTile("overworld", 5, 25);
    expect(room.id).toBe("greenwood-vale");
    expect(room.kind).toBe("outdoorRegion");
  });

  test("lists authored regions independently from authored rooms", () => {
    const regions = authoredRegionsForMap("overworld");
    expect(regions.some((region) => region.id === "greenwood-vale")).toBe(true);
    expect(regions.some((region) => region.id === "silverwater-reach")).toBe(true);
  });
});
