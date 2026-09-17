export const SPINNING_SAW_TYPE = "spinning-saw";

const OVERWORLD_COLS = 16;
const OVERWORLD_ROWS = 16;
const ROOM_COLS = 16;
const ROOM_ROWS = 10;

// Keep the opening grove and the main settlements free of periodic saw spawns.
const SAFE_ROOMS = new Set([
  "1,0", // Hero's Grove
  "1,1", // Willowbrook Village
  "5,3", // Rosewall Hamlet
  "7,6", // Moonstone Keep
]);

export const SPINNING_SAW_ART = Object.freeze({
  source: "/art/enemies/spinning-saw.png.png",
  width: 64,
  height: 64,
  // About 1.6 turns per second: visually fast without turning into a blur.
  rotationSpeed: Math.PI * 3.2,
});

export function catalogSpinningSawArt(category, id) {
  if (category !== "enemies" || id !== SPINNING_SAW_TYPE) return null;
  return SPINNING_SAW_ART;
}

export function spinningSawDefinitions() {
  const definitions = [];

  for (let roomY = 0; roomY < OVERWORLD_ROWS; roomY += 1) {
    for (let roomX = 0; roomX < OVERWORLD_COLS; roomX += 1) {
      if (SAFE_ROOMS.has(`${roomX},${roomY}`)) continue;

      // Deterministic spacing makes the saw a recurring overworld threat
      // without filling every screen with one.
      if ((roomX * 3 + roomY * 5) % 7 !== 0) continue;

      const localX = 4 + ((roomX * 5 + roomY * 3) % 8);
      const localY = 3 + ((roomX * 2 + roomY * 4) % 4);
      definitions.push([
        `periodic-saw-${roomX}-${roomY}`,
        SPINNING_SAW_TYPE,
        roomX * ROOM_COLS + localX,
        roomY * ROOM_ROWS + localY,
      ]);
    }
  }

  return definitions;
}

export function installSpinningSawSpawns(maps) {
  const enemies = maps?.overworld?.enemies;
  if (!Array.isArray(enemies)) return 0;

  const existingIds = new Set(enemies.map(([id]) => id));
  const additions = spinningSawDefinitions()
    .filter(([id]) => !existingIds.has(id));

  enemies.push(...additions);
  return additions.length;
}
