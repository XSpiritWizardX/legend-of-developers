import {
  CONNECTION_TYPE,
  connectionAtEdge,
  connectionsFrom,
  destinationFor,
} from "./roomConnections";

describe("logical room connections", () => {
  test("connects unequal Rootbound Temple rooms through authored doorway spans", () => {
    const connection = connectionAtEdge({
      mapId: "d01",
      roomId: "d01-west-gallery",
      edge: "east",
      offset: 4,
    });
    expect(connection.id).toBe("gallery-to-nave");
    expect(connection.type).toBe(CONNECTION_TYPE.DOOR);
    expect(destinationFor(connection, "d01-west-gallery").roomId).toBe("d01-grand-nave");
  });

  test("does not treat the whole shared wall as a doorway", () => {
    const connection = connectionAtEdge({
      mapId: "d01",
      roomId: "d01-west-gallery",
      edge: "east",
      offset: 8,
    });
    expect(connection).toBeNull();
  });

  test("supports gated connections without changing room dimensions", () => {
    const gated = connectionsFrom("d01", "d01-grand-nave")
      .find((connection) => connection.id === "nave-to-sanctum");
    expect(gated.gate).toBe("door_d01");
    expect(gated.fromSpan.length).toBe(4);
    expect(gated.toSpan.length).toBe(4);
  });

  test("supports seamless overworld connections and stairs", () => {
    const exits = connectionsFrom("overworld", "willowbrook-village");
    expect(exits.some((connection) => connection.type === CONNECTION_TYPE.STAIRS)).toBe(true);
  });
});
