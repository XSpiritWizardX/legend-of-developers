export const BOSS_V2_CATALOG = Object.freeze({
  minibossNullKnight: Object.freeze({
    source: "/art/v2/enemies/miniboss-null-knight.svg",
    width: 96,
    height: 96,
    offsetX: -16,
    offsetY: -24,
  }),
  bossCacheColossus: Object.freeze({
    source: "/art/v2/enemies/boss-cache-colossus.svg",
    width: 128,
    height: 128,
    offsetX: -32,
    offsetY: -48,
  }),
  bossFluxSovereign: Object.freeze({
    source: "/art/v2/enemies/boss-flux-sovereign.svg",
    width: 128,
    height: 128,
    offsetX: -32,
    offsetY: -48,
  }),
  bossRootWarden: Object.freeze({
    source: "/art/v2/enemies/boss-root-warden.svg",
    width: 128,
    height: 128,
    offsetX: -32,
    offsetY: -48,
  }),
  knight: Object.freeze({
    source: "/art/v2/enemies/miniboss-null-knight.svg",
    width: 96,
    height: 96,
    offsetX: -16,
    offsetY: -24,
  }),
  boss: Object.freeze({
    source: "/art/v2/enemies/boss-cache-colossus.svg",
    width: 128,
    height: 128,
    offsetX: -32,
    offsetY: -48,
  }),
  mage: Object.freeze({
    source: "/art/v2/enemies/boss-flux-sovereign.svg",
    width: 128,
    height: 128,
    offsetX: -32,
    offsetY: -48,
  }),
});

export function catalogBossArtV2(category, id) {
  return category === "enemies" ? BOSS_V2_CATALOG[id] || null : null;
}
