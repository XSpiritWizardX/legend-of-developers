import {
  EMBERSTONE_ACTION,
  EMBERSTONE_FLAG,
  EMBERSTONE_POINT,
  EMBERSTONE_TARGET,
  emberstoneContextAction,
  emberstoneGateBlocks,
  emberstonePuzzleState,
  emberstoneWindDiscTarget,
  nextEmberstoneStoryBeat,
  resolveEmberstoneAction,
  resolveEmberstoneWindDiscHit,
} from "./emberstoneContent";

const TILE = 64;
const center = (point) => ({ x: point.tx * TILE + TILE / 2, y: point.ty * TILE + TILE / 2 });

describe("Emberstone Ruins content", () => {
  test("Wind Disc can vent the two outer furnace regulators in either order", () => {
    const west = emberstoneWindDiscTarget({ mapId: "d02", ...center(EMBERSTONE_TARGET.WEST_REGULATOR), flags: {}, tileSize: TILE });
    const westResult = resolveEmberstoneWindDiscHit(west, {});
    expect(westResult.changed).toBe(true);
    const withWest = { ...westResult.patch };
    expect(emberstonePuzzleState(withWest)).toMatchObject({ west: true, east: false, ready: false });

    const east = emberstoneWindDiscTarget({ mapId: "d02", ...center(EMBERSTONE_TARGET.EAST_REGULATOR), flags: withWest, tileSize: TILE });
    const eastResult = resolveEmberstoneWindDiscHit(east, withWest);
    const ready = { ...withWest, ...eastResult.patch };
    expect(emberstonePuzzleState(ready).ready).toBe(true);
  });

  test("already vented regulators stop catching the Wind Disc", () => {
    const flags = { [EMBERSTONE_FLAG.WEST_REGULATOR]: true };
    expect(emberstoneWindDiscTarget({
      mapId: "d02",
      ...center(EMBERSTONE_TARGET.WEST_REGULATOR),
      flags,
      tileSize: TILE,
    })).toBeNull();
  });

  test("pressure core explains missing regulators before allowing the vent action", () => {
    const player = center(EMBERSTONE_POINT.CORE_CONSOLE);
    expect(emberstoneContextAction({ mapId: "d02", player, flags: {}, tileSize: TILE }))
      .toMatchObject({ key: "L", label: "INSPECT" });
    const blocked = resolveEmberstoneAction(EMBERSTONE_ACTION.VENT_CORE, {});
    expect(blocked.changed).toBe(false);
    expect(blocked.message).toMatch(/WIND DISC/);

    const readyFlags = {
      [EMBERSTONE_FLAG.WEST_REGULATOR]: true,
      [EMBERSTONE_FLAG.EAST_REGULATOR]: true,
    };
    expect(emberstoneContextAction({ mapId: "d02", player, flags: readyFlags, tileSize: TILE }))
      .toMatchObject({ key: "L", label: "VENT" });
    const opened = resolveEmberstoneAction(EMBERSTONE_ACTION.VENT_CORE, readyFlags);
    expect(opened.changed).toBe(true);
    expect(opened.patch[EMBERSTONE_FLAG.GATE_OPEN]).toBe(true);
  });

  test("Forge Gate collision persists until the pressure core vents", () => {
    const x = 23.5 * TILE;
    const y = 16.5 * TILE;
    expect(emberstoneGateBlocks({ mapId: "d02", x, y, flags: {}, tileSize: TILE })).toBe(true);
    expect(emberstoneGateBlocks({
      mapId: "d02", x, y, flags: { [EMBERSTONE_FLAG.CORE_VENTED]: true }, tileSize: TILE,
    })).toBe(false);
    expect(emberstoneGateBlocks({ mapId: "d01", x, y, flags: {}, tileSize: TILE })).toBe(false);
  });

  test("solved forge exposes a one-time optional ash-worker cache", () => {
    const solved = { [EMBERSTONE_FLAG.GATE_OPEN]: true };
    const action = emberstoneContextAction({
      mapId: "d02", player: center(EMBERSTONE_POINT.SECRET), flags: solved, tileSize: TILE,
    });
    expect(action).toMatchObject({ key: "L", label: "SEARCH", action: EMBERSTONE_ACTION.SECRET });
    const reward = resolveEmberstoneAction(EMBERSTONE_ACTION.SECRET, solved);
    expect(reward).toMatchObject({ changed: true, reward: "bombBag", coins: 30 });
    expect(resolveEmberstoneAction(EMBERSTONE_ACTION.SECRET, { ...solved, ...reward.patch }).changed).toBe(false);
  });

  test("story beats are proximity based and one-shot", () => {
    const player = center(EMBERSTONE_POINT.THRESHOLD_CLUE);
    const beat = nextEmberstoneStoryBeat({ mapId: "d02", player, flags: {}, tileSize: TILE });
    expect(beat.flag).toBe(EMBERSTONE_FLAG.CLUE_SEEN);
    expect(nextEmberstoneStoryBeat({
      mapId: "d02", player, flags: { [EMBERSTONE_FLAG.CLUE_SEEN]: true }, tileSize: TILE,
    })).toBeNull();
  });
});
