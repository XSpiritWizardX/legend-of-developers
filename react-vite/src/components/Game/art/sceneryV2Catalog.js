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
  coastBridgeApproach: Object.freeze({ source: "/art/v2/props/coast-bridge-approach.svg", width: 96, height: 80, offsetX: -16, offsetY: -16 }),
  coastWaterfallMistForeground: Object.freeze({ source: "/art/v2/props/coast-waterfall-mist-foreground.svg", width: 160, height: 96, offsetX: -48, offsetY: -416 }),
  desertRuinArchForeground: Object.freeze({ source: "/art/v2/props/desert-ruin-arch-foreground.svg", width: 160, height: 128, offsetX: -48, offsetY: -448 }),
  desertOasisGlow: Object.freeze({ source: "/art/v2/props/desert-oasis-glow.svg", width: 128, height: 96, offsetX: -32, offsetY: -16 }),
  caveCeilingForeground: Object.freeze({ source: "/art/v2/props/cave-ceiling-foreground.svg", width: 192, height: 112, offsetX: -64, offsetY: -448 }),
  crystalGlowOverlay: Object.freeze({ source: "/art/v2/props/crystal-glow-overlay.svg", width: 128, height: 128, offsetX: -32, offsetY: -48 }),
  rootboundFloorCracks: Object.freeze({ source: "/art/v2/props/rootbound-floor-cracks.svg" }),
  rootboundRootGrowth: Object.freeze({ source: "/art/v2/props/rootbound-root-growth.svg", width: 96, height: 96, offsetX: -16, offsetY: -32 }),
  rootboundCrystalGrowth: Object.freeze({ source: "/art/v2/props/rootbound-crystal-growth.svg", width: 96, height: 96, offsetX: -16, offsetY: -32 }),
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
  reactorDoor: Object.freeze({ source: "/art/v2/props/reactor-door.svg", width: 128, height: 96, offsetY: -64 }),
  reactorCore: Object.freeze({ source: "/art/v2/props/reactor-core.svg", width: 96, height: 128, offsetX: -16, offsetY: -64 }),
  reactorHeatVent: Object.freeze({ source: "/art/v2/props/reactor-heat-vent.svg" }),
  reactorConduit: Object.freeze({ source: "/art/v2/props/reactor-conduit.svg", width: 96, height: 64, offsetX: -16 }),
  reactorLavaGrate: Object.freeze({ source: "/art/v2/props/reactor-lava-grate.svg" }),
  reactorGantryForeground: Object.freeze({ source: "/art/v2/props/reactor-gantry-foreground.svg", width: 160, height: 112, offsetX: -48, offsetY: -448 }),
  serverDoor: Object.freeze({ source: "/art/v2/props/server-door.svg", width: 128, height: 96, offsetY: -64 }),
  serverHydraulicPump: Object.freeze({ source: "/art/v2/props/server-hydraulic-pump.svg", width: 96, height: 112, offsetX: -16, offsetY: -48 }),
  serverCoolantPipe: Object.freeze({ source: "/art/v2/props/server-coolant-pipe.svg", width: 96, height: 64, offsetX: -16 }),
  serverColumn: Object.freeze({ source: "/art/v2/props/server-column.svg", width: 80, height: 128, offsetX: -8, offsetY: -64 }),
  serverTurbineGrate: Object.freeze({ source: "/art/v2/props/server-turbine-grate.svg" }),
  serverAqueductForeground: Object.freeze({ source: "/art/v2/props/server-aqueduct-foreground.svg", width: 160, height: 112, offsetX: -48, offsetY: -448 }),
  forestCanopyForeground: Object.freeze({ source: "/art/props/forest-canopy.png", width: 128, height: 96, offsetX: -32, offsetY: -448 }),
  forestCliffLipForeground: Object.freeze({ source: "/art/props/forest-cliff-lip.png", width: 64, height: 32, offsetY: -416 }),
  rootboundArchForeground: Object.freeze({ source: "/art/props/rootbound-arch-foreground.png", width: 128, height: 128, offsetX: -32, offsetY: -448 }),
  rootboundHangingRootsForeground: Object.freeze({ source: "/art/props/rootbound-hanging-roots.png", width: 96, height: 96, offsetX: -16, offsetY: -448 }),
});

export function catalogSceneryArtV2(category, id) {
  if (category === "tiles") return TILE_SCENERY[id] || catalogCompletionArtV2(category, id);
  if (category === "props") return PROP_SCENERY[id] || catalogCompletionArtV2(category, id);
  return null;
}

export { PROP_SCENERY, TILE_SCENERY };
