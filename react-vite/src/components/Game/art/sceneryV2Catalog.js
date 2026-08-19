import { catalogCompletionArtV2 } from "./completionV2Catalog";

const TILE_SCENERY = Object.freeze({
  sh: Object.freeze({ source: "/art/v2/tiles/coast-shore.svg" }),
  fm: Object.freeze({ source: "/art/v2/props/coast-foam.svg", width: 96, height: 48, offsetX: -16, offsetY: 8 }),
  re: Object.freeze({ source: "/art/v2/props/coast-reeds.svg", width: 64, height: 80, offsetY: -16 }),
  dk: Object.freeze({ source: "/art/v2/props/coast-dock.svg", width: 64, height: 128, offsetY: -64 }),
  bt: Object.freeze({ source: "/art/v2/props/coast-boat.svg", width: 96, height: 128, offsetX: -16, offsetY: -64 }),
  wf: Object.freeze({ source: "/art/v2/props/coast-waterfall.svg", width: 64, height: 128, offsetY: -64 }),
  ly: Object.freeze({ source: "/art/v2/props/coast-lily-pad.svg", width: 64, height: 56, offsetY: 8 }),
  co: Object.freeze({ source: "/art/v2/props/coast-coral.svg", width: 72, height: 72, offsetX: -4, offsetY: -8 }),
  bridge: Object.freeze({ source: "/art/v2/props/bridge-vertical.svg" }),
  lockedDoor: Object.freeze({ source: "/art/v2/props/dungeon-locked-door.svg", width: 128, height: 96 }),
  barrier: Object.freeze({ source: "/art/v2/props/dungeon-barrier.svg", width: 160, height: 80, offsetX: -48, offsetY: -16 }),
  switch: Object.freeze({ source: "/art/v2/props/dungeon-switch.svg" }),
  dd: Object.freeze({ source: "/art/v2/props/dungeon-door.svg", width: 96, height: 128, offsetX: -16, offsetY: -64 }),
  dl: Object.freeze({ source: "/art/v2/props/dungeon-locked-door.svg", width: 96, height: 128, offsetX: -16, offsetY: -64 }),
  eb: Object.freeze({ source: "/art/v2/props/dungeon-barrier.svg", width: 160, height: 80, offsetX: -48, offsetY: -16 }),
  ps: Object.freeze({ source: "/art/v2/props/dungeon-switch.svg" }),
  gs: Object.freeze({ source: "/art/v2/props/dungeon-statue.svg", width: 112, height: 144, offsetX: -24, offsetY: -80 }),
  pi: Object.freeze({ source: "/art/v2/props/dungeon-pillar.svg", width: 96, height: 144, offsetX: -16, offsetY: -80 }),
  tm: Object.freeze({ source: "/art/v2/props/dungeon-terminal.svg", width: 80, height: 104, offsetX: -8, offsetY: -40 }),
  tp: Object.freeze({ source: "/art/v2/props/dungeon-spike-trap.svg" }),
  dn: Object.freeze({ source: "/art/v2/props/dungeon-stairs.svg", width: 96, height: 80, offsetX: -16, offsetY: -16 }),
  pg: Object.freeze({ source: "/art/v2/props/dungeon-portal.svg", width: 112, height: 112, offsetX: -24, offsetY: -48 }),
});

const PROP_SCENERY = Object.freeze({
  coastFoam: TILE_SCENERY.fm,
  coastReeds: TILE_SCENERY.re,
  coastDock: TILE_SCENERY.dk,
  coastBoat: TILE_SCENERY.bt,
  coastWaterfall: TILE_SCENERY.wf,
  coastLilyPad: TILE_SCENERY.ly,
  coastCoral: TILE_SCENERY.co,
  dungeonDoor: Object.freeze({ source: "/art/v2/props/dungeon-door.svg", width: 128, height: 96, offsetY: -64 }),
  dungeonLockedDoor: Object.freeze({ source: "/art/v2/props/dungeon-locked-door.svg", width: 128, height: 96, offsetY: -64 }),
  dungeonBarrier: TILE_SCENERY.eb,
  dungeonSwitch: TILE_SCENERY.ps,
  dungeonStatue: TILE_SCENERY.gs,
  dungeonPillar: TILE_SCENERY.pi,
  dungeonTerminal: TILE_SCENERY.tm,
  dungeonSpikeTrap: TILE_SCENERY.tp,
  dungeonStairs: TILE_SCENERY.dn,
  dungeonPortal: TILE_SCENERY.pg,
});

export function catalogSceneryArtV2(category, id) {
  if (category === "tiles") return TILE_SCENERY[id] || catalogCompletionArtV2(category, id);
  if (category === "props") return PROP_SCENERY[id] || catalogCompletionArtV2(category, id);
  return null;
}

export { PROP_SCENERY, TILE_SCENERY };
