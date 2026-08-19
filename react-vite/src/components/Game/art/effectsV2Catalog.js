export const EFFECTS_V2_CATALOG = Object.freeze({
  cssPulse: Object.freeze({ source: "/art/v2/effects/css-pulse.svg" }),
  codeExplosion: Object.freeze({ source: "/art/v2/effects/code-explosion.svg" }),
  firewallBurst: Object.freeze({ source: "/art/v2/effects/firewall-burst.svg" }),
  freezeBurst: Object.freeze({ source: "/art/v2/effects/freeze-burst.svg" }),
  rootSurge: Object.freeze({ source: "/art/v2/effects/root-surge.svg" }),
});

export function catalogEffectsArtV2(category, id) {
  return category === "effects" ? EFFECTS_V2_CATALOG[id] || null : null;
}
