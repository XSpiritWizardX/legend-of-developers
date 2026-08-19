export const EMBERSTONE_MAP_ID = "d02";

export const EMBERSTONE_FLAG = Object.freeze({
  CLUE_SEEN: "emberstone_clue_seen",
  WEST_STORY_SEEN: "emberstone_west_story_seen",
  EAST_STORY_SEEN: "emberstone_east_story_seen",
  CORE_STORY_SEEN: "emberstone_core_story_seen",
  WEST_REGULATOR: "emberstone_west_regulator",
  EAST_REGULATOR: "emberstone_east_regulator",
  CORE_VENTED: "emberstone_core_vented",
  GATE_OPEN: "emberstone_gate_open",
  SECRET_CLAIMED: "emberstone_secret_claimed",
});

export const EMBERSTONE_ACTION = Object.freeze({
  VENT_CORE: "ventCore",
  SECRET: "secret",
});

export const EMBERSTONE_TARGET = Object.freeze({
  WEST_REGULATOR: Object.freeze({ tx: 12, ty: 15, radius: 30, id: "west" }),
  EAST_REGULATOR: Object.freeze({ tx: 35, ty: 15, radius: 30, id: "east" }),
});

export const EMBERSTONE_POINT = Object.freeze({
  THRESHOLD_CLUE: Object.freeze({ tx: 24, ty: 24, radius: 88 }),
  WEST_STORY: Object.freeze({ tx: 8, ty: 15, radius: 96 }),
  EAST_STORY: Object.freeze({ tx: 40, ty: 15, radius: 96 }),
  CORE_STORY: Object.freeze({ tx: 24, ty: 15, radius: 104 }),
  CORE_CONSOLE: Object.freeze({ tx: 24, ty: 15, radius: 72 }),
  SECRET: Object.freeze({ tx: 43, ty: 17, radius: 70 }),
});

export const EMBERSTONE_GATE = Object.freeze({
  centerTx: 23.5,
  centerTy: 16.5,
  halfWidthTiles: 1.55,
  halfHeightTiles: 0.52,
});

function center(point, tileSize) {
  return {
    x: point.tx * tileSize + tileSize / 2,
    y: point.ty * tileSize + tileSize / 2,
  };
}

function near(player, point, tileSize = 64) {
  if (!player || !point) return false;
  const target = center(point, tileSize);
  return Math.hypot(player.x - target.x, player.y - target.y) <= point.radius;
}

export function emberstonePuzzleState(flags = {}) {
  const west = Boolean(flags[EMBERSTONE_FLAG.WEST_REGULATOR]);
  const east = Boolean(flags[EMBERSTONE_FLAG.EAST_REGULATOR]);
  const ready = west && east;
  const coreVented = Boolean(flags[EMBERSTONE_FLAG.CORE_VENTED]);
  return {
    west,
    east,
    ready,
    coreVented,
    gateOpen: Boolean(flags[EMBERSTONE_FLAG.GATE_OPEN] || coreVented),
    secretClaimed: Boolean(flags[EMBERSTONE_FLAG.SECRET_CLAIMED]),
  };
}

export function emberstoneWindDiscTarget({
  mapId,
  x,
  y,
  flags = {},
  tileSize = 64,
}) {
  if (mapId !== EMBERSTONE_MAP_ID) return null;
  const state = emberstonePuzzleState(flags);
  for (const target of Object.values(EMBERSTONE_TARGET)) {
    if ((target.id === "west" && state.west) || (target.id === "east" && state.east)) continue;
    const targetCenter = center(target, tileSize);
    if (Math.hypot(x - targetCenter.x, y - targetCenter.y) <= target.radius) return target;
  }
  return null;
}

export function resolveEmberstoneWindDiscHit(target, flags = {}) {
  if (!target) return { changed: false };
  const flag = target.id === "west"
    ? EMBERSTONE_FLAG.WEST_REGULATOR
    : EMBERSTONE_FLAG.EAST_REGULATOR;
  if (flags[flag]) return { changed: false };
  const nextFlags = { ...flags, [flag]: true };
  const nextState = emberstonePuzzleState(nextFlags);
  return {
    changed: true,
    patch: { [flag]: true },
    event: "regulator",
    message: nextState.ready
      ? "SECOND FURNACE VENTED · PRESSURE CORE READY"
      : "FURNACE REGULATOR VENTED · ANOTHER PRESSURE LINE STILL BURNS",
  };
}

export function emberstoneContextAction({
  mapId,
  player,
  flags = {},
  tileSize = 64,
}) {
  if (mapId !== EMBERSTONE_MAP_ID) return null;
  const state = emberstonePuzzleState(flags);
  if (!state.coreVented && near(player, EMBERSTONE_POINT.CORE_CONSOLE, tileSize)) {
    return state.ready
      ? { key: "L", label: "VENT", action: EMBERSTONE_ACTION.VENT_CORE }
      : { key: "L", label: "INSPECT", action: EMBERSTONE_ACTION.VENT_CORE };
  }
  if (state.gateOpen && !state.secretClaimed && near(player, EMBERSTONE_POINT.SECRET, tileSize)) {
    return { key: "L", label: "SEARCH", action: EMBERSTONE_ACTION.SECRET };
  }
  return null;
}

export function resolveEmberstoneAction(action, flags = {}) {
  const state = emberstonePuzzleState(flags);
  if (action === EMBERSTONE_ACTION.VENT_CORE) {
    if (state.coreVented) return { changed: false };
    if (!state.ready) {
      const missing = !state.west && !state.east
        ? "BOTH OUTER FURNACES"
        : (!state.west ? "WESTERN FURNACE" : "EASTERN FURNACE");
      return {
        changed: false,
        event: "hint",
        message: `PRESSURE CORE LOCKED · VENT ${missing} WITH THE WIND DISC`,
      };
    }
    return {
      changed: true,
      patch: {
        [EMBERSTONE_FLAG.CORE_VENTED]: true,
        [EMBERSTONE_FLAG.GATE_OPEN]: true,
      },
      event: "gate",
      message: "PRESSURE RELEASED · THE FORGE GATE COOLS AND OPENS",
    };
  }
  if (action === EMBERSTONE_ACTION.SECRET) {
    if (!state.gateOpen || state.secretClaimed) return { changed: false };
    return {
      changed: true,
      patch: { [EMBERSTONE_FLAG.SECRET_CLAIMED]: true },
      reward: "bombBag",
      coins: 30,
      event: "secret",
      message: "ASH-WORKER'S CACHE FOUND · BOMB SATCHEL RESTOCKED",
    };
  }
  return { changed: false };
}

export function emberstoneGateBlocks({
  mapId,
  x,
  y,
  flags = {},
  tileSize = 64,
}) {
  if (mapId !== EMBERSTONE_MAP_ID || emberstonePuzzleState(flags).gateOpen) return false;
  const gate = {
    x: EMBERSTONE_GATE.centerTx * tileSize,
    y: EMBERSTONE_GATE.centerTy * tileSize,
  };
  return Math.abs(x - gate.x) <= EMBERSTONE_GATE.halfWidthTiles * tileSize
    && Math.abs(y - gate.y) <= EMBERSTONE_GATE.halfHeightTiles * tileSize;
}

export function nextEmberstoneStoryBeat({
  mapId,
  player,
  flags = {},
  tileSize = 64,
}) {
  if (mapId !== EMBERSTONE_MAP_ID) return null;
  const beats = [
    {
      flag: EMBERSTONE_FLAG.CLUE_SEEN,
      point: EMBERSTONE_POINT.THRESHOLD_CLUE,
      message: "FORGE INSCRIPTION · WIND REACHES THE BELLOWS WHERE HANDS CANNOT",
    },
    {
      flag: EMBERSTONE_FLAG.WEST_STORY_SEEN,
      point: EMBERSTONE_POINT.WEST_STORY,
      message: "A PRESSURE PIPE VANISHES BEHIND THE GRATE · ITS REGULATOR HUMS BEYOND REACH",
    },
    {
      flag: EMBERSTONE_FLAG.EAST_STORY_SEEN,
      point: EMBERSTONE_POINT.EAST_STORY,
      message: "HOT ASH STREAMS FROM A SECOND REMOTE REGULATOR",
    },
    {
      flag: EMBERSTONE_FLAG.CORE_STORY_SEEN,
      point: EMBERSTONE_POINT.CORE_STORY,
      message: "THE PRESSURE CORE SHUDDERS · TWO OUTER LINES FEED THE SEALED FORGE",
    },
  ];
  return beats.find((beat) => !flags[beat.flag] && near(player, beat.point, tileSize)) || null;
}
