import { cameraForRoom } from "./roomGeometry";
import { logicalRoomAtTile } from "./worldLayout";
import { resolveRoomRuntime } from "./roomRuntime";

const TILE = 64;
const VIEWPORT = { width: 1024, height: 640 };

function playerAtTile(tx, ty) {
  return { x: tx * TILE + TILE / 2, y: ty * TILE + TILE / 2 };
}

describe("variable-size room camera matrix", () => {
  test("overworld exposes intentionally different logical room sizes", () => {
    expect(logicalRoomAtTile("overworld", 20, 4).bounds).toEqual({ x: 16, y: 0, width: 16, height: 10 });
    expect(logicalRoomAtTile("overworld", 20, 12).bounds).toEqual({ x: 16, y: 10, width: 32, height: 20 });
    expect(logicalRoomAtTile("overworld", 50, 4).bounds).toEqual({ x: 48, y: 0, width: 16, height: 20 });
    expect(logicalRoomAtTile("overworld", 2, 25).bounds).toEqual({ x: 0, y: 0, width: 64, height: 40 });
    expect(logicalRoomAtTile("overworld", 80, 30).bounds).toEqual({ x: 64, y: 20, width: 64, height: 60 });
    expect(logicalRoomAtTile("willowCave", 4, 4).bounds).toEqual({ x: 0, y: 0, width: 12, height: 8 });
  });

  test("large overworld regions use continuous camera movement, not legacy handoffs", () => {
    const runtime = resolveRoomRuntime({
      mapId: "overworld",
      player: playerAtTile(2, 25),
      viewport: VIEWPORT,
      tileSize: TILE,
      previousCamera: { x: 0, y: 0 },
    });
    expect(runtime.room.id).toBe("greenwood-vale");
    expect(runtime.usesLegacyTransitions).toBe(false);
    expect(runtime.legacyHandoff).toBe(false);
  });

  test("clamped camera follows through the middle of a huge region", () => {
    const room = logicalRoomAtTile("overworld", 2, 25);
    const player = playerAtTile(32, 20);
    const camera = cameraForRoom({ room, player, viewport: VIEWPORT, tileSize: TILE });
    expect(camera.x).toBe(player.x - VIEWPORT.width / 2);
    expect(camera.y).toBe(player.y - VIEWPORT.height / 2);
  });

  test("huge-region camera clamps at the top-left boundary", () => {
    const room = logicalRoomAtTile("overworld", 2, 25);
    const camera = cameraForRoom({
      room,
      player: playerAtTile(1, 1),
      viewport: VIEWPORT,
      tileSize: TILE,
    });
    expect(camera.x).toBe(0);
    expect(camera.y).toBe(0);
  });

  test("huge-region camera clamps at the bottom-right boundary", () => {
    const room = logicalRoomAtTile("overworld", 2, 25);
    const camera = cameraForRoom({
      room,
      player: playerAtTile(62, 38),
      viewport: VIEWPORT,
      tileSize: TILE,
    });
    expect(camera.x).toBe(64 * TILE - VIEWPORT.width);
    expect(camera.y).toBe(40 * TILE - VIEWPORT.height);
  });

  test("small interiors remain centered instead of exposing outside space", () => {
    const room = logicalRoomAtTile("willowCave", 4, 4);
    const camera = cameraForRoom({
      room,
      player: playerAtTile(4, 4),
      viewport: VIEWPORT,
      tileSize: TILE,
    });
    expect(camera.x).toBe((12 * TILE - VIEWPORT.width) / 2);
    expect(camera.y).toBe((8 * TILE - VIEWPORT.height) / 2);
  });
});
