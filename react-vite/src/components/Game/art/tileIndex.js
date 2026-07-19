import { editableRoomAt } from "../rooms/roomRegistry";

export const TILE_INDEX = {
  g: { tile: "grass", solid: false },
  p: { tile: "village", solid: false },
  s: { tile: "stone", solid: false },
  d: { tile: "desert", solid: false },
  a: { tile: "desertAlt", solid: false },
  w: { tile: "water", solid: true },
  b: { tile: "bridge", solid: false },
  f: { tile: "dungeonFloor", solid: false },
  m: { tile: "dungeonFloorAlt", solid: false },
  v: { tile: "void", solid: true },
  "#": { tile: "wall", solid: true },
  T: { tile: "forest", solid: true },
  R: { tile: "mountain", solid: true },
  "~": { tile: "water", solid: true },
  D: { tile: "lockedDoor", solid: true },
  B: { tile: "barrier", solid: true },
  gr: { tile: "grass", solid: false },
  pt: { tile: "village", solid: false },
  st: { tile: "stone", solid: false },
  dt: { tile: "desert", solid: false },
  sa: { tile: "desertAlt", solid: false },
  ds: { tile: "desert", solid: false },
  ck: { tile: "desertAlt", solid: false },
  du: { tile: "desert", solid: true },
  dc: { tile: "mountain", solid: true },
  ca: { tile: "desert", solid: true },
  db: { tile: "desertAlt", solid: true },
  bn: { tile: "desert", solid: false },
  dr: { tile: "mountain", solid: true },
  ru: { tile: "wall", solid: true },
  oa: { tile: "water", solid: true },
  sh: { tile: "desert", solid: false },
  ow: { tile: "water", solid: true },
  fm: { tile: "water", solid: true },
  re: { tile: "water", solid: false },
  dk: { tile: "bridge", solid: false },
  bt: { tile: "water", solid: true },
  wf: { tile: "water", solid: true },
  ly: { tile: "water", solid: false },
  co: { tile: "water", solid: true },
  cv: { tile: "dungeonFloor", solid: false },
  cw: { tile: "wall", solid: true },
  cp: { tile: "void", solid: true },
  cm: { tile: "mountain", solid: true },
  cb: { tile: "dungeonFloor", solid: false },
  ct: { tile: "dungeonFloor", solid: false },
  xf: { tile: "dungeonFloorAlt", solid: false },
  xw: { tile: "wall", solid: true },
  xs: { tile: "mountain", solid: true },
  xl: { tile: "mountain", solid: true },
  mf: { tile: "dungeonFloor", solid: false },
  mw: { tile: "wall", solid: true },
  rf: { tile: "dungeonFloorAlt", solid: false },
  rw: { tile: "wall", solid: true },
  sf: { tile: "dungeonFloor", solid: false },
  sv: { tile: "wall", solid: true },
  dd: { tile: "lockedDoor", solid: true },
  dl: { tile: "lockedDoor", solid: true },
  eb: { tile: "barrier", solid: true },
  ps: { tile: "dungeonFloor", solid: false },
  gs: { tile: "wall", solid: true },
  pi: { tile: "wall", solid: true },
  wa: { tile: "water", solid: true },
  br: { tile: "bridge", solid: false },
  df: { tile: "dungeonFloor", solid: false },
  mt: { tile: "dungeonFloorAlt", solid: false },
  vd: { tile: "void", solid: true },
  "##": { tile: "wall", solid: true },
  rk: { tile: "mountain", solid: true },
  tr: { tile: "forest", solid: true },
  bu: { tile: "forest", solid: true },
  fl: { tile: "grass", solid: false },
  ms: { tile: "grass", solid: false },
  sp: { tile: "forest", solid: true },
  lg: { tile: "forest", solid: true },
  tg: { tile: "grass", solid: false },
  cf: { tile: "mountain", solid: true },
  sw: { tile: "water", solid: false },
  le: { tile: "mountain", solid: true },
  ss: { tile: "stone", solid: false },
  dw: { tile: "water", solid: true },
  vh: { tile: "house", solid: true },
  vs: { tile: "house", solid: true },
  fn: { tile: "wall", solid: true },
  sg: { tile: "village", solid: true },
  lp: { tile: "village", solid: true },
  wl: { tile: "stone", solid: true },
  ld: { tile: "lockedDoor", solid: true },
  ba: { tile: "barrier", solid: true },
};

function rowCodes(row) {
  if (!row) return [];
  if (Array.isArray(row)) return row;
  const trimmed = row.trim();
  if (trimmed.includes(" ")) return trimmed.split(/\s+/);
  if (trimmed.length === 16) return [...trimmed];
  return trimmed.match(/.{1,2}/g) || [];
}

export function indexedRoomTileAt(mapId, tx, ty) {
  const roomX = Math.floor(tx / 16);
  const roomY = Math.floor(ty / 10);
  const localX = tx - roomX * 16;
  const localY = ty - roomY * 10;
  const room = editableRoomAt(mapId, roomX, roomY);
  if (!room) return null;

  const wallCode = rowCodes(room.walls?.[localY])[localX];
  const floorCode = rowCodes(room.floor?.[localY])[localX];
  const code = wallCode && wallCode !== ".." ? wallCode : floorCode;
  const definition = TILE_INDEX[code];
  return definition ? { code, ...definition } : null;
}
