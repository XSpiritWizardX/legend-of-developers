import {
  TERRAIN,
  TRAVERSAL_STATE,
  canHopLedge,
  interactionProbe,
  ledgeLandingPoint,
  recoveryPoint,
  rememberSafeGround,
  terrainTraversalFor,
} from "./terrainInteractions";

describe("terrain traversal rules", () => {
  test("a one-way ledge only permits travel in its authored drop direction", () => {
    expect(canHopLedge(TERRAIN.LEDGE_DOWN, "down")).toBe(true);
    expect(canHopLedge(TERRAIN.LEDGE_DOWN, "up")).toBe(false);
    expect(terrainTraversalFor({ tile: TERRAIN.LEDGE_DOWN, direction: "down" })).toEqual({
      state: TRAVERSAL_STATE.HOP,
      blocksMovement: false,
    });
    expect(terrainTraversalFor({ tile: TERRAIN.LEDGE_DOWN, direction: "left" })).toEqual({
      state: TRAVERSAL_STATE.WALK,
      blocksMovement: true,
    });
  });

  test("ledge landing clears the source tile in the facing direction", () => {
    expect(ledgeLandingPoint({ x: 128, y: 128, direction: "down", tileSize: 64 })).toEqual({
      x: 128,
      y: 201.6,
    });
    expect(ledgeLandingPoint({ x: 128, y: 128, direction: "left", tileSize: 64 })).toEqual({
      x: 54.400000000000006,
      y: 128,
    });
  });

  test("pits trigger a fall rather than acting like an ordinary wall", () => {
    expect(terrainTraversalFor({ tile: TERRAIN.PIT, direction: "down" })).toEqual({
      state: TRAVERSAL_STATE.FALL,
      blocksMovement: false,
    });
  });

  test("deep water requires flippers and becomes a swim state when equipped", () => {
    expect(terrainTraversalFor({
      tile: TERRAIN.DEEP_WATER,
      direction: "right",
      hasFlippers: false,
    })).toEqual({
      state: TRAVERSAL_STATE.WALK,
      blocksMovement: true,
    });
    expect(terrainTraversalFor({
      tile: TERRAIN.DEEP_WATER,
      direction: "right",
      hasFlippers: true,
    })).toEqual({
      state: TRAVERSAL_STATE.SWIM,
      blocksMovement: false,
    });
  });

  test("contextual interaction probes in front of the player instead of using radial proximity", () => {
    expect(interactionProbe({ x: 100, y: 200, direction: "up", distance: 32 })).toEqual({
      x: 100,
      y: 168,
    });
    expect(interactionProbe({ x: 100, y: 200, direction: "right", distance: 32 })).toEqual({
      x: 132,
      y: 200,
    });
  });

  test("fall recovery returns the most recently recorded safe ground", () => {
    let history = [];
    history = rememberSafeGround(history, { x: 64, y: 64 });
    history = rememberSafeGround(history, { x: 96, y: 64 });
    expect(recoveryPoint(history, { x: 32, y: 32 })).toEqual({ x: 96, y: 64 });
    expect(recoveryPoint([], { x: 32, y: 32 })).toEqual({ x: 32, y: 32 });
  });
});
