import { WORLD_OBJECT_KIND } from "./worldObjects";

const WORLD_OBJECT_ART = Object.freeze({
  [WORLD_OBJECT_KIND.POT]: Object.freeze({
    id: "worldPot",
    width: 64,
    height: 72,
    offsetX: -32,
    offsetY: -54,
  }),
  [WORLD_OBJECT_KIND.ROCK]: Object.freeze({
    id: "worldRock",
    width: 72,
    height: 64,
    offsetX: -36,
    offsetY: -48,
  }),
  [WORLD_OBJECT_KIND.BRUSH]: Object.freeze({
    id: "worldBrush",
    width: 72,
    height: 56,
    offsetX: -36,
    offsetY: -42,
  }),
});

export function worldObjectArtFor(kind) {
  return WORLD_OBJECT_ART[kind] || null;
}

export function worldObjectDrawBox(kind, x, y, { carried = false } = {}) {
  const art = worldObjectArtFor(kind);
  if (!art) return null;
  const carryLift = carried ? 8 : 0;
  return {
    id: art.id,
    x: x + art.offsetX,
    y: y + art.offsetY - carryLift,
    width: art.width,
    height: art.height,
  };
}
