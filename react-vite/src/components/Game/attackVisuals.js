const ATTACK_EFFECT_TYPES = new Set(["sword", "swordSpin"]);

export function activeAttackEffect(weaponEffects = []) {
  for (let index = weaponEffects.length - 1; index >= 0; index -= 1) {
    const effect = weaponEffects[index];
    if (ATTACK_EFFECT_TYPES.has(effect?.type) && effect.time < effect.duration) return effect;
  }
  return null;
}

export function attackVisualFrame(effect, frames = 4) {
  if (!effect || !Number.isFinite(effect.duration) || effect.duration <= 0) return null;
  const progress = Math.max(0, Math.min(0.999999, (effect.time || 0) / effect.duration));
  const cycles = effect.type === "swordSpin" ? 2 : 1;
  return Math.floor((progress * frames * cycles) % frames);
}

export function activeAttackVisual(weaponEffects = [], frames = 4) {
  const effect = activeAttackEffect(weaponEffects);
  if (!effect) return null;
  return {
    effect,
    frame: attackVisualFrame(effect, frames),
    spinning: effect.type === "swordSpin",
  };
}
