export const EQUIPMENT_V2_CATALOG = Object.freeze({
  htmlSword: Object.freeze({ source: "/art/v2/items/html-sword.svg" }),
  boomerang: Object.freeze({ source: "/art/v2/items/wind-disc.svg" }),
  bow: Object.freeze({ source: "/art/v2/items/oak-bow.svg" }),
  bombs: Object.freeze({ source: "/art/v2/items/code-bomb.svg" }),
  hookshot: Object.freeze({ source: "/art/v2/items/api-grappler.svg" }),
  fireRod: Object.freeze({ source: "/art/v2/items/fire-rod.svg" }),
  iceRod: Object.freeze({ source: "/art/v2/items/ice-rod.svg" }),
  hammer: Object.freeze({ source: "/art/v2/items/refactor-hammer.svg" }),
  lantern: Object.freeze({ source: "/art/v2/items/dark-mode-lamp.svg" }),
  mirror: Object.freeze({ source: "/art/v2/items/revert-mirror.svg" }),
  cape: Object.freeze({ source: "/art/v2/items/vpn-cloak.svg" }),
  medallion: Object.freeze({ source: "/art/v2/items/root-medallion.svg" }),
  devJacket: Object.freeze({ source: "/art/v2/items/dev-jacket.svg" }),
  shield: Object.freeze({ source: "/art/v2/items/debug-shield.svg" }),
  glove: Object.freeze({ source: "/art/v2/items/power-gloves.svg" }),
  boots: Object.freeze({ source: "/art/v2/items/speed-boots.svg" }),
});

export function catalogEquipmentArtV2(category, id) {
  return category === "items" ? EQUIPMENT_V2_CATALOG[id] || null : null;
}
