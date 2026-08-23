export const EFFECTS_V2_CATALOG = Object.freeze({
  cssPulse: Object.freeze({ source: "/art/v2/effects/css-pulse.svg" }),
  codeExplosion: Object.freeze({ source: "/art/v2/effects/code-explosion.svg" }),
  firewallBurst: Object.freeze({ source: "/art/v2/effects/firewall-burst.svg" }),
  freezeBurst: Object.freeze({ source: "/art/v2/effects/freeze-burst.svg" }),
  rootSurge: Object.freeze({ source: "/art/v2/effects/root-surge.svg" }),
  swordArc: Object.freeze({ source: "/art/v2/effects/sword-arc.svg", width: 96, height: 96 }),
  projectileStreak: Object.freeze({ source: "/art/v2/effects/projectile-streak.svg", width: 96, height: 48 }),
  bombBurst: Object.freeze({ source: "/art/v2/effects/bomb-burst.svg", width: 128, height: 128 }),
  crystalBurst: Object.freeze({ source: "/art/v2/effects/crystal-burst.svg", width: 128, height: 128 }),
  portalRipple: Object.freeze({ source: "/art/v2/effects/portal-ripple.svg", width: 128, height: 128 }),
  bossPhaseAura: Object.freeze({ source: "/art/v2/effects/boss-phase-aura.svg", width: 192, height: 192 }),
});

export function catalogEffectsArtV2(category, id) {
  return category === "effects" ? EFFECTS_V2_CATALOG[id] || null : null;
}
