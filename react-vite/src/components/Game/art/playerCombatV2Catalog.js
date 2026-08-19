export const PLAYER_COMBAT_V2_CATALOG = Object.freeze({
  playerAttack: Object.freeze({
    source: "/art/v2/characters/player-attack-sheet.svg",
    sheet: Object.freeze({
      columns: 4,
      rows: 4,
      frameWidth: 64,
      frameHeight: 64,
      framesPerDirection: 4,
      directions: Object.freeze(["down", "left", "right", "up"]),
    }),
    frameDuration: 45,
    loop: false,
  }),
});

export function catalogPlayerCombatArtV2(category, id) {
  return category === "characters" ? PLAYER_COMBAT_V2_CATALOG[id] || null : null;
}
