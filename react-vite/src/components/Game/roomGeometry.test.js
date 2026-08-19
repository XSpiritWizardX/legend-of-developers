import {
  CAMERA_MODE,
  cameraForRoom,
  containsTile,
  legacyScreenRoom,
  selectLogicalRoom,
} from "./roomGeometry";
import { logicalRoomAtTile } from "./worldLayout";

const TILE = 64;
const VIEWPORT = { width: 1024, height: 640 };

describe("variable-size room geometry", () => {
  test("supports rooms smaller than the legacy 16x10 screen", () => {
    const room = { bounds: { x: 10, y: 10, width: 8, height: 6 } };
    expect(containsTile(room, 10, 10)).toBe(true);
    expect(containsTile(room, 17, 15)).toBe(true);
    expect(containsTile(room, 18, 15)).toBe(false);
  });

  test("prefers a specific room over a broad containing region", () => {
    const rooms = [
      { id: "region", bounds: { x: 0, y: 0, width: 64, height: 40 } },
      { id: "village", bounds: { x: 16, y: 10, width: 32, height: 20 }, priority: 8 },
    ];
    expect(selectLogicalRoom(rooms, 20, 12).id).toBe("village");
  });

  test("centers a small locked room instead of stretching it to one full screen", () => {
    const room = {
      bounds: { x: 10, y: 10, width: 8, height: 6 },
      camera: CAMERA_MODE.LOCKED,
    };
    const camera = cameraForRoom({
      room,
      player: { x: 14 * TILE, y: 13 * TILE },
      viewport: VIEWPORT,
      tileSize: TILE,
    });
    expect(camera.x).toBe(10 * TILE + ((8 * TILE) - VIEWPORT.width) / 2);
    expect(camera.y).toBe(10 * TILE + ((6 * TILE) - VIEWPORT.height) / 2);
  });

  test("clamps camera movement inside a large room", () => {
    const room = {
      bounds: { x: 0, y: 0, width: 32, height: 20 },
      camera: CAMERA_MODE.CLAMPED_FOLLOW,
    };
    const nearStart = cameraForRoom({
      room,
      player: { x: 2 * TILE, y: 2 * TILE },
      viewport: VIEWPORT,
      tileSize: TILE,
    });
    const nearEnd = cameraForRoom({
      room,
      player: { x: 31 * TILE, y: 19 * TILE },
      viewport: VIEWPORT,
      tileSize: TILE,
    });
    expect(nearStart.x).toBe(0);
    expect(nearStart.y).toBe(0);
    expect(nearEnd.x).toBe((32 * TILE) - VIEWPORT.width);
    expect(nearEnd.y).toBe((20 * TILE) - VIEWPORT.height);
  });

  test("keeps legacy screen fallback for unauthored coordinates", () => {
    const legacy = legacyScreenRoom({ mapId: "overworld", tileX: 81, tileY: 52 });
    expect(legacy.bounds).toEqual({ x: 80, y: 50, width: 16, height: 10 });
    expect(legacy.legacy).toBe(true);
  });

  test("Rootbound Temple now exposes differently sized logical chambers", () => {
    expect(logicalRoomAtTile("d01", 5, 5).id).toBe("d01-west-gallery");
    expect(logicalRoomAtTile("d01", 20, 5).id).toBe("d01-grand-nave");
    expect(logicalRoomAtTile("d01", 10, 20).id).toBe("d01-lower-crypt");
    expect(logicalRoomAtTile("d01", 35, 20).id).toBe("d01-root-sanctum");
  });
});
