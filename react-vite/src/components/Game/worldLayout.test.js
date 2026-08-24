import {
  authoredConnectionsForRoom,
  authoredRegionsForMap,
  authoredRoomsForMap,
  logicalRoomAtTile,
} from "./worldLayout";

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

  test("Rootbound chambers expose authored edge connections instead of relying on screen reciprocity", () => {
    const naveConnections = authoredConnectionsForRoom("d01", "d01-grand-nave");
    expect(naveConnections).toEqual(expect.arrayContaining([
      expect.objectContaining({ edge: "west", to: "d01-west-gallery" }),
      expect.objectContaining({ edge: "south", to: "d01-lower-crypt" }),
      expect.objectContaining({ edge: "south", to: "d01-root-sanctum" }),
    ]));
    expect(authoredConnectionsForRoom("d01", "missing-room")).toEqual([]);
  });

  test("Rootbound mixes authored room dimensions inside one dungeon coordinate space", () => {
    const rooms = authoredRoomsForMap("d01");
    const dimensions = rooms.map((room) => `${room.bounds.width}x${room.bounds.height}`);
    expect(new Set(dimensions).size).toBeGreaterThan(1);
    expect(logicalRoomAtTile("d01", 8, 5).id).toBe("d01-west-gallery");
    expect(logicalRoomAtTile("d01", 30, 5).id).toBe("d01-grand-nave");
    expect(logicalRoomAtTile("d01", 10, 20).id).toBe("d01-lower-crypt");
    expect(logicalRoomAtTile("d01", 36, 20).id).toBe("d01-root-sanctum");
  });
});