export const NPC_V2_CATALOG = Object.freeze({
  merchantTraveler: Object.freeze({
    source: "/art/v2/characters/merchant-traveler.svg",
    width: 88,
    height: 112,
    offsetX: -12,
    offsetY: -48,
  }),
  merchantTechnician: Object.freeze({
    source: "/art/v2/characters/merchant-technician.svg",
    width: 88,
    height: 112,
    offsetX: -12,
    offsetY: -48,
  }),
  questArchivist: Object.freeze({
    source: "/art/v2/characters/quest-archivist.svg",
    width: 80,
    height: 112,
    offsetX: -8,
    offsetY: -48,
  }),
  questNetworkScout: Object.freeze({
    source: "/art/v2/characters/quest-network-scout.svg",
    width: 80,
    height: 104,
    offsetX: -8,
    offsetY: -40,
  }),
});

export function catalogNpcArtV2(category, id) {
  return category === "characters" ? NPC_V2_CATALOG[id] || null : null;
}
