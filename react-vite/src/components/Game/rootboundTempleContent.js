export const ROOTBOUND_MAP_ID = "d01";

export const ROOTBOUND_FLAG = Object.freeze({
  CLUE_SEEN: "rootbound_clue_seen",
  WEST_STORY_SEEN: "rootbound_west_story_seen",
  EAST_STORY_SEEN: "rootbound_east_story_seen",
  SANCTUM_STORY_SEEN: "rootbound_sanctum_story_seen",
  WEST_SEAL: "rootbound_west_seal",
  EAST_SEAL: "rootbound_east_seal",
  GATE_OPEN: "rootbound_gate_open",
  SECRET_CLAIMED: "rootbound_secret_claimed",
});

export const ROOTBOUND_ACTION = Object.freeze({
  WEST_SEAL: "westSeal",
  EAST_SEAL: "eastSeal",
  SECRET: "secret",
});

export const ROOTBOUND_POINT = Object.freeze({
  THRESHOLD_CLUE: Object.freeze({ tx: 24, ty: 24, radius: 86 }),
  WEST_STORY: Object.freeze({ tx: 4, ty: 15, radius: 92 }),
  WEST_SEAL: Object.freeze({ tx: 6, ty: 15, radius: 70 }),
  EAST_STORY: Object.freeze({ tx: 40, ty: 15, radius: 92 }),
  EAST_SEAL: Object.freeze({ tx: 41, ty: 15, radius: 70 }),
  SECRET: Object.freeze({ tx: 3, ty: 15, radius: 68 }),
  SANCTUM_STORY: Object.freeze({ tx: 24, ty: 8, radius: 92 }),
});

export const ROOTBOUND_GATE = Object.freeze({
  centerTx: 23.5,
  centerTy: 16,
  halfWidthTiles: 1.55,
  halfHeightTiles: 0.52,
});

function pointCenter(point, tileSize) {
  return {
    x: point.tx * tileSize + tileSize / 2,
    y: point.ty * tileSize + tileSize / 2,
  };
}

function nearPoint(player, point, tileSize = 64) {
  if (!player || !point) return false;
  const center = pointCenter(point, tileSize);
  return Math.hypot(player.x - center.x, player.y - center.y) <= point.radius;
}

export function rootboundPuzzleState(flags = {}) {
  const west = Boolean(flags[ROOTBOUND_FLAG.WEST_SEAL]);
  const east = Boolean(flags[ROOTBOUND_FLAG.EAST_SEAL]);
  const gateOpen = Boolean(flags[ROOTBOUND_FLAG.GATE_OPEN] || (west && east));
  return {
    west,
    east,
    gateOpen,
    secretClaimed: Boolean(flags[ROOTBOUND_FLAG.SECRET_CLAIMED]),
  };
}

export function rootboundContextAction({
  mapId,
  player,
  flags = {},
  tileSize = 64,
}) {
  if (mapId !== ROOTBOUND_MAP_ID) return null;
  const state = rootboundPuzzleState(flags);

  if (!state.west && nearPoint(player, ROOTBOUND_POINT.WEST_SEAL, tileSize)) {
    return { key: "L", label: "ATTUNE", action: ROOTBOUND_ACTION.WEST_SEAL };
  }
  if (!state.east && nearPoint(player, ROOTBOUND_POINT.EAST_SEAL, tileSize)) {
    return { key: "L", label: "ATTUNE", action: ROOTBOUND_ACTION.EAST_SEAL };
  }
  if (state.gateOpen && !state.secretClaimed && nearPoint(player, ROOTBOUND_POINT.SECRET, tileSize)) {
    return { key: "L", label: "SEARCH", action: ROOTBOUND_ACTION.SECRET };
  }
  return null;
}

export function resolveRootboundAction(action, flags = {}) {
  const state = rootboundPuzzleState(flags);

  if (action === ROOTBOUND_ACTION.WEST_SEAL) {
    if (state.west) return { changed: false };
    return {
      changed: true,
      patch: { [ROOTBOUND_FLAG.WEST_SEAL]: true },
      message: "THE KEEPER'S ROOT AWAKENS · THE EASTERN SEAL ANSWERS IN DISTANCE",
      event: "seal",
    };
  }

  if (action === ROOTBOUND_ACTION.EAST_SEAL) {
    if (state.east) return { changed: false };
    if (!state.west) {
      return {
        changed: false,
        message: "THE EASTERN ROOT WILL NOT ANSWER · SEEK THE KEEPER FIRST",
        event: "hint",
      };
    }
    return {
      changed: true,
      patch: {
        [ROOTBOUND_FLAG.EAST_SEAL]: true,
        [ROOTBOUND_FLAG.GATE_OPEN]: true,
      },
      message: "THE SECOND ROOT AWAKENS · THE HEART GATE UNBINDS",
      event: "gate",
    };
  }

  if (action === ROOTBOUND_ACTION.SECRET) {
    if (!state.gateOpen || state.secretClaimed) return { changed: false };
    return {
      changed: true,
      patch: { [ROOTBOUND_FLAG.SECRET_CLAIMED]: true },
      reward: "heart",
      coins: 25,
      message: "KEEPER'S HEART FOUND · THE TEMPLE REWARDS THOSE WHO LOOK BACK",
      event: "secret",
    };
  }

  return { changed: false };
}

export function rootboundGateBlocks({
  mapId,
  x,
  y,
  flags = {},
  tileSize = 64,
}) {
  if (mapId !== ROOTBOUND_MAP_ID || rootboundPuzzleState(flags).gateOpen) return false;
  const centerX = ROOTBOUND_GATE.centerTx * tileSize;
  const centerY = ROOTBOUND_GATE.centerTy * tileSize;
  return Math.abs(x - centerX) <= ROOTBOUND_GATE.halfWidthTiles * tileSize
    && Math.abs(y - centerY) <= ROOTBOUND_GATE.halfHeightTiles * tileSize;
}

export function nextRootboundStoryBeat({
  mapId,
  player,
  flags = {},
  tileSize = 64,
}) {
  if (mapId !== ROOTBOUND_MAP_ID) return null;

  const beats = [
    {
      flag: ROOTBOUND_FLAG.CLUE_SEEN,
      point: ROOTBOUND_POINT.THRESHOLD_CLUE,
      message: "ROOTSTONE INSCRIPTION · THE KEEPER WAKES THE WESTERN ROOT; THE EAST ANSWERS",
    },
    {
      flag: ROOTBOUND_FLAG.WEST_STORY_SEEN,
      point: ROOTBOUND_POINT.WEST_STORY,
      message: "THE KEEPER'S STATUE POINTS TO A ROOT-SEAL BURIED IN THE FLOOR",
    },
    {
      flag: ROOTBOUND_FLAG.EAST_STORY_SEEN,
      point: ROOTBOUND_POINT.EAST_STORY,
      message: "CRYSTAL DUST MARKS THE CARTOGRAPHER'S SECOND SEAL",
    },
    {
      flag: ROOTBOUND_FLAG.SANCTUM_STORY_SEEN,
      point: ROOTBOUND_POINT.SANCTUM_STORY,
      message: "HEARTROOT SANCTUM · SOMETHING BENEATH THE STONE IS BREATHING",
    },
  ];

  return beats.find((beat) => !flags[beat.flag] && nearPoint(player, beat.point, tileSize)) || null;
}

export function rootboundBossPhase({ type, hp, maxHp }) {
  if (type !== "bossCacheColossus") return 1;
  if (!Number.isFinite(hp) || !Number.isFinite(maxHp) || maxHp <= 0) return 1;
  return hp <= maxHp * 0.5 ? 2 : 1;
}

export function rootboundBossSpeedScale(phase) {
  return phase >= 2 ? 1.24 : 1;
}

export function rootboundBossAttackCooldown(phase) {
  return phase >= 2 ? 1.45 : 2.35;
}
