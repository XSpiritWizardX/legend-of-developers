export const CONNECTION_TYPE = Object.freeze({
  SEAMLESS: "seamless",
  DOOR: "door",
  STAIRS: "stairs",
  DROP: "drop",
  CAVE: "cave",
  TELEPORT: "teleport",
});

export const EDGE = Object.freeze({
  NORTH: "north",
  SOUTH: "south",
  WEST: "west",
  EAST: "east",
  INTERIOR: "interior",
});

const CONNECTIONS = {
  d01: [
    {
      id: "gallery-to-nave",
      from: "d01-west-gallery",
      to: "d01-grand-nave",
      fromEdge: EDGE.EAST,
      toEdge: EDGE.WEST,
      fromSpan: { start: 4, length: 2 },
      toSpan: { start: 4, length: 2 },
      type: CONNECTION_TYPE.DOOR,
    },
    {
      id: "gallery-to-crypt",
      from: "d01-west-gallery",
      to: "d01-lower-crypt",
      fromEdge: EDGE.SOUTH,
      toEdge: EDGE.NORTH,
      fromSpan: { start: 6, length: 3 },
      toSpan: { start: 4, length: 3 },
      type: CONNECTION_TYPE.STAIRS,
    },
    {
      id: "nave-to-sanctum",
      from: "d01-grand-nave",
      to: "d01-root-sanctum",
      fromEdge: EDGE.SOUTH,
      toEdge: EDGE.NORTH,
      fromSpan: { start: 14, length: 4 },
      toSpan: { start: 10, length: 4 },
      type: CONNECTION_TYPE.DOOR,
      gate: "door_d01",
    },
    {
      id: "crypt-to-sanctum",
      from: "d01-lower-crypt",
      to: "d01-root-sanctum",
      fromEdge: EDGE.EAST,
      toEdge: EDGE.WEST,
      fromSpan: { start: 11, length: 3 },
      toSpan: { start: 11, length: 3 },
      type: CONNECTION_TYPE.SEAMLESS,
    },
  ],
  overworld: [
    {
      id: "heros-grove-to-willowbrook",
      from: "heros-grove",
      to: "willowbrook-village",
      fromEdge: EDGE.SOUTH,
      toEdge: EDGE.NORTH,
      fromSpan: { start: 7, length: 2 },
      toSpan: { start: 7, length: 2 },
      type: CONNECTION_TYPE.SEAMLESS,
    },
    {
      id: "willowbrook-to-oldgrowth-ascent",
      from: "willowbrook-village",
      to: "oldgrowth-ascent",
      fromEdge: EDGE.NORTH,
      toEdge: EDGE.SOUTH,
      fromSpan: { start: 22, length: 3 },
      toSpan: { start: 7, length: 3 },
      type: CONNECTION_TYPE.STAIRS,
    },
  ],
};

export function connectionsForMap(mapId) {
  return [...(CONNECTIONS[mapId] || [])];
}

export function connectionsFrom(mapId, roomId) {
  return connectionsForMap(mapId).filter((connection) => connection.from === roomId);
}

export function connectionsTouching(mapId, roomId) {
  return connectionsForMap(mapId)
    .filter((connection) => connection.from === roomId || connection.to === roomId);
}

export function connectionAtEdge({ mapId, roomId, edge, offset }) {
  return connectionsTouching(mapId, roomId).find((connection) => {
    const forward = connection.from === roomId;
    const connectionEdge = forward ? connection.fromEdge : connection.toEdge;
    const span = forward ? connection.fromSpan : connection.toSpan;
    return connectionEdge === edge
      && offset >= span.start
      && offset < span.start + span.length;
  }) || null;
}

export function destinationFor(connection, fromRoomId) {
  if (!connection) return null;
  if (connection.from === fromRoomId) {
    return {
      roomId: connection.to,
      edge: connection.toEdge,
      span: connection.toSpan,
      type: connection.type,
      gate: connection.gate,
    };
  }
  if (connection.to === fromRoomId) {
    return {
      roomId: connection.from,
      edge: connection.fromEdge,
      span: connection.fromSpan,
      type: connection.type,
      gate: connection.gate,
    };
  }
  return null;
}

export { CONNECTIONS };
