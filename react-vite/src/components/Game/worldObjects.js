import { interactionProbe } from "./terrainInteractions";

export const WORLD_OBJECT_KIND = Object.freeze({
  POT: "pot",
  ROCK: "rock",
  BRUSH: "brush",
});

const DEFINITIONS = Object.freeze({
  overworld: [
    { id: "willow-pot-west", kind: WORLD_OBJECT_KIND.POT, tx: 22, ty: 17, solid: true, liftable: true, breakable: true },
    { id: "willow-pot-east", kind: WORLD_OBJECT_KIND.POT, tx: 25, ty: 17, solid: true, liftable: true, breakable: true },
    { id: "willow-rock", kind: WORLD_OBJECT_KIND.ROCK, tx: 29, ty: 17, solid: true, pushable: true, liftable: true, liftRequires: "glove" },
    { id: "willow-brush-west", kind: WORLD_OBJECT_KIND.BRUSH, tx: 19, ty: 16, solid: true, cuttable: true, breakable: true },
    { id: "willow-brush-east", kind: WORLD_OBJECT_KIND.BRUSH, tx: 28, ty: 16, solid: true, cuttable: true, breakable: true },
  ],
});

const flagKey = (id, property) => `worldObject_${id}_${property}`;

export function worldObjectDefinitions(mapId) {
  return DEFINITIONS[mapId] || [];
}

export function objectWorldPosition(object, flags = {}, tileSize = 64) {
  const tx = Number.isFinite(flags[flagKey(object.id, "tx")])
    ? flags[flagKey(object.id, "tx")]
    : object.tx;
  const ty = Number.isFinite(flags[flagKey(object.id, "ty")])
    ? flags[flagKey(object.id, "ty")]
    : object.ty;
  return {
    tx,
    ty,
    x: tx * tileSize + tileSize / 2,
    y: ty * tileSize + tileSize / 2,
  };
}

export function activeWorldObjects(mapId, flags = {}, tileSize = 64) {
  return worldObjectDefinitions(mapId)
    .filter((object) => !flags[flagKey(object.id, "removed")])
    .map((object) => ({ ...object, ...objectWorldPosition(object, flags, tileSize) }));
}

export function removeWorldObject(flags, id) {
  flags[flagKey(id, "removed")] = true;
}

export function moveWorldObject(flags, id, tx, ty) {
  flags[flagKey(id, "tx")] = tx;
  flags[flagKey(id, "ty")] = ty;
}

export function worldObjectAtPoint(objects, x, y, radius = 23, ignoreId = null) {
  return (objects || []).find((object) => object.id !== ignoreId
    && object.solid
    && Math.hypot(object.x - x, object.y - y) <= radius) || null;
}

export function facingWorldObject({ objects, player, direction, distance = 42, radius = 32 }) {
  const probe = interactionProbe({
    x: player.x,
    y: player.y,
    direction,
    distance,
  });
  return (objects || [])
    .filter((object) => Math.hypot(object.x - probe.x, object.y - probe.y) <= radius)
    .sort((a, b) => (
      Math.hypot(a.x - probe.x, a.y - probe.y)
      - Math.hypot(b.x - probe.x, b.y - probe.y)
    ))[0] || null;
}

export function pushDestination(object, direction) {
  const vectors = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };
  const vector = vectors[direction];
  if (!vector) return null;
  return { tx: object.tx + vector.x, ty: object.ty + vector.y };
}

export function canLiftWorldObject(object, inventory = {}) {
  if (!object?.liftable) return false;
  if (!object.liftRequires) return true;
  return Boolean(inventory[object.liftRequires]);
}

export function breakableBySword(object) {
  return Boolean(object?.cuttable || (object?.breakable && object.kind === WORLD_OBJECT_KIND.POT));
}
