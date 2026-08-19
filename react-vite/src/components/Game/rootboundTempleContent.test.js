import {
  ROOTBOUND_ACTION,
  ROOTBOUND_FLAG,
  ROOTBOUND_POINT,
  nextRootboundStoryBeat,
  resolveRootboundAction,
  rootboundBossAttackCooldown,
  rootboundBossPhase,
  rootboundBossSpeedScale,
  rootboundContextAction,
  rootboundGateBlocks,
  rootboundPuzzleState,
} from "./rootboundTempleContent";

const TILE = 64;
const playerAt = (point) => ({
  x: point.tx * TILE + TILE / 2,
  y: point.ty * TILE + TILE / 2,
});

describe("Rootbound Temple content", () => {
  test("west then east seals form a persistent gate progression", () => {
    const empty = {};
    expect(rootboundPuzzleState(empty)).toEqual({
      west: false,
      east: false,
      gateOpen: false,
      secretClaimed: false,
    });

    const west = resolveRootboundAction(ROOTBOUND_ACTION.WEST_SEAL, empty);
    expect(west.changed).toBe(true);
    const withWest = { ...empty, ...west.patch };
    expect(rootboundPuzzleState(withWest).west).toBe(true);

    const east = resolveRootboundAction(ROOTBOUND_ACTION.EAST_SEAL, withWest);
    expect(east.changed).toBe(true);
    const solved = { ...withWest, ...east.patch };
    expect(rootboundPuzzleState(solved).gateOpen).toBe(true);
  });

  test("east seal refuses to activate before the keeper seal", () => {
    const result = resolveRootboundAction(ROOTBOUND_ACTION.EAST_SEAL, {});
    expect(result.changed).toBe(false);
    expect(result.message).toMatch(/KEEPER/);
  });

  test("context prompts expose attune and secret-search actions", () => {
    expect(rootboundContextAction({
      mapId: "d01",
      player: playerAt(ROOTBOUND_POINT.WEST_SEAL),
      flags: {},
      tileSize: TILE,
    })).toMatchObject({ key: "L", label: "ATTUNE", action: ROOTBOUND_ACTION.WEST_SEAL });

    const solved = {
      [ROOTBOUND_FLAG.WEST_SEAL]: true,
      [ROOTBOUND_FLAG.EAST_SEAL]: true,
      [ROOTBOUND_FLAG.GATE_OPEN]: true,
    };
    expect(rootboundContextAction({
      mapId: "d01",
      player: playerAt(ROOTBOUND_POINT.SECRET),
      flags: solved,
      tileSize: TILE,
    })).toMatchObject({ key: "L", label: "SEARCH", action: ROOTBOUND_ACTION.SECRET });
  });

  test("the keeper secret grants one permanent reward and coins", () => {
    const solved = {
      [ROOTBOUND_FLAG.WEST_SEAL]: true,
      [ROOTBOUND_FLAG.EAST_SEAL]: true,
      [ROOTBOUND_FLAG.GATE_OPEN]: true,
    };
    const reward = resolveRootboundAction(ROOTBOUND_ACTION.SECRET, solved);
    expect(reward.changed).toBe(true);
    expect(reward.reward).toBe("heart");
    expect(reward.coins).toBe(25);
    const claimed = { ...solved, ...reward.patch };
    expect(resolveRootboundAction(ROOTBOUND_ACTION.SECRET, claimed).changed).toBe(false);
  });

  test("the central Heart Gate blocks movement only until both seals resolve", () => {
    const x = 23.5 * TILE;
    const y = 16 * TILE;
    expect(rootboundGateBlocks({ mapId: "d01", x, y, flags: {}, tileSize: TILE })).toBe(true);
    expect(rootboundGateBlocks({
      mapId: "d01",
      x,
      y,
      flags: {
        [ROOTBOUND_FLAG.WEST_SEAL]: true,
        [ROOTBOUND_FLAG.EAST_SEAL]: true,
      },
      tileSize: TILE,
    })).toBe(false);
    expect(rootboundGateBlocks({ mapId: "d02", x, y, flags: {}, tileSize: TILE })).toBe(false);
  });

  test("story beats are proximity based and one-shot through save flags", () => {
    const player = playerAt(ROOTBOUND_POINT.THRESHOLD_CLUE);
    const beat = nextRootboundStoryBeat({ mapId: "d01", player, flags: {}, tileSize: TILE });
    expect(beat.flag).toBe(ROOTBOUND_FLAG.CLUE_SEEN);
    expect(nextRootboundStoryBeat({
      mapId: "d01",
      player,
      flags: { [ROOTBOUND_FLAG.CLUE_SEEN]: true },
      tileSize: TILE,
    })).toBeNull();
  });

  test("Cache Colossus enters a faster second phase at half health", () => {
    expect(rootboundBossPhase({ type: "bossCacheColossus", hp: 8, maxHp: 15 })).toBe(1);
    expect(rootboundBossPhase({ type: "bossCacheColossus", hp: 7, maxHp: 15 })).toBe(2);
    expect(rootboundBossSpeedScale(2)).toBeGreaterThan(rootboundBossSpeedScale(1));
    expect(rootboundBossAttackCooldown(2)).toBeLessThan(rootboundBossAttackCooldown(1));
    expect(rootboundBossPhase({ type: "bossRootWarden", hp: 1, maxHp: 15 })).toBe(1);
  });
});
