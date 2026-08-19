import {
  resolveRoomRuntime,
  roomChanged,
  settleCamera,
  smoothCamera,
} from "./roomRuntime";

const TILE = 64;
const VIEWPORT = { width: 1024, height: 640 };

function runtimeAt(mapId, tileX, tileY, previousCamera = { x: 0, y: 0 }) {
  return resolveRoomRuntime({
    mapId,
    player: {
      x: tileX * TILE + TILE / 2,
      y: tileY * TILE + TILE / 2,
    },
    viewport: VIEWPORT,
    tileSize: TILE,
    previousCamera,
  });
}

describe("logical room runtime adapter", () => {
  test("uses the authored Hero's Grove room instead of a generic screen", () => {
    const runtime = runtimeAt("overworld", 24, 4);

    expect(runtime.room.id).toBe("heros-grove");
    expect(runtime.title).toBe("Hero's Grove");
    expect(runtime.discoveryKey).toBe("overworld:room:heros-grove");
    expect(runtime.usesLegacyTransitions).toBe(false);
    expect(runtime.targetCamera).toEqual({ x: 1024, y: 0 });
  });

  test("large authored rooms produce player-following camera targets", () => {
    const runtime = runtimeAt("overworld", 40, 20);

    expect(runtime.room.id).toBe("willowbrook-village");
    expect(runtime.usesLegacyTransitions).toBe(false);
    expect(runtime.targetCamera.x).toBeGreaterThanOrEqual(16 * TILE);
    expect(runtime.targetCamera.x).toBeLessThanOrEqual(32 * TILE);
    expect(runtime.targetCamera.y).toBeGreaterThanOrEqual(10 * TILE);
    expect(runtime.targetCamera.y).toBeLessThanOrEqual(20 * TILE);
  });

  test("a 12x8 interior is centered inside the larger viewport", () => {
    const runtime = runtimeAt("willowCave", 6, 6);

    expect(runtime.room.id).toBe("willowbrook-hollow");
    expect(runtime.title).toBe("Willowbrook Hollow");
    expect(runtime.usesLegacyTransitions).toBe(false);
    expect(runtime.targetCamera).toEqual({ x: -128, y: -64 });
  });

  test("broad outdoor regions can remain on legacy transitions while tiles are re-authored", () => {
    const runtime = runtimeAt("overworld", 4, 4);

    expect(runtime.room.id).toBe("greenwood-vale");
    expect(runtime.room.legacy).not.toBe(true);
    expect(runtime.usesLegacyTransitions).toBe(true);
  });

  test("authored dungeon partitions can be staged without losing room metadata", () => {
    const runtime = runtimeAt("d01", 8, 5);

    expect(runtime.room.id).toBe("d01-west-gallery");
    expect(runtime.title).toBe("Rootbound West Gallery");
    expect(runtime.usesLegacyTransitions).toBe(true);
  });

  test("unmigrated maps keep the legacy transition contract", () => {
    const runtime = runtimeAt("d02", 24, 28);

    expect(runtime.room.legacy).toBe(true);
    expect(runtime.usesLegacyTransitions).toBe(true);
    expect(runtime.discoveryKey).toBe("d02:room:d02:legacy:1,2");
  });

  test("roomChanged only fires when the logical room id changes", () => {
    const runtime = runtimeAt("overworld", 24, 4);

    expect(roomChanged("heros-grove", runtime)).toBe(false);
    expect(roomChanged("greenwood-vale", runtime)).toBe(true);
  });

  test("smoothCamera approaches the target without overshooting", () => {
    const current = { x: 0, y: 0 };
    const target = { x: 1000, y: 500 };
    const next = smoothCamera(current, target, 1 / 60);

    expect(next.x).toBeGreaterThan(0);
    expect(next.x).toBeLessThan(target.x);
    expect(next.y).toBeGreaterThan(0);
    expect(next.y).toBeLessThan(target.y);
    expect(settleCamera(target)).toEqual(target);
  });
});
