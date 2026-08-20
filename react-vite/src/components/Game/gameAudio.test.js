import {
  GAME_SFX,
  playGameSfx,
  setGameSfxVolume,
  sfxPatternFor,
  unlockGameAudio,
} from "./gameAudio";

describe("gameplay sound effects", () => {
  test("the production sound bank covers every declared cue", () => {
    expect(Object.values(GAME_SFX).length).toBeGreaterThanOrEqual(30);
    Object.values(GAME_SFX).forEach((type) => {
      expect(sfxPatternFor(type).length).toBeGreaterThan(0);
    });
  });

  test("release-critical player feedback cues remain available", () => {
    const required = [
      "DASH", "CHARGE", "PLAYER_HURT", "ENEMY_DEFEAT", "BOSS_PHASE", "BOSS_DEFEAT",
      "SECRET", "SWITCH", "DOOR", "ERROR", "GRAPPLE", "FIRE", "ICE", "BOMB", "HEART", "KEY",
    ];
    required.forEach((name) => {
      expect(GAME_SFX[name]).toBeTruthy();
      expect(sfxPatternFor(GAME_SFX[name]).length).toBeGreaterThan(0);
    });
  });

  test("pickup and chest cues rise into a reward cadence", () => {
    const pickup = sfxPatternFor(GAME_SFX.PICKUP);
    const chest = sfxPatternFor(GAME_SFX.CHEST);
    expect(pickup).toHaveLength(3);
    expect(chest.length).toBeGreaterThanOrEqual(3);
    expect(pickup[2].from).toBeGreaterThan(pickup[0].from);
    expect(chest[2].from).toBeGreaterThan(chest[0].from);
  });

  test("sword, fall and throw cues preserve directional pitch motion", () => {
    const tonal = (pattern) => pattern.find((note) => !note.noise);
    const sword = tonal(sfxPatternFor(GAME_SFX.SWORD));
    const fall = tonal(sfxPatternFor(GAME_SFX.FALL));
    const thrown = tonal(sfxPatternFor(GAME_SFX.THROW));
    expect(sword.to).toBeLessThan(sword.from);
    expect(fall.to).toBeLessThan(fall.from);
    expect(thrown.to).toBeLessThan(thrown.from);
  });

  test("combat and environment cues include transient texture layers", () => {
    expect(sfxPatternFor(GAME_SFX.SWORD).some((note) => note.noise)).toBe(true);
    expect(sfxPatternFor(GAME_SFX.BOMB).some((note) => note.noise)).toBe(true);
    expect(sfxPatternFor(GAME_SFX.SPLASH).some((note) => note.noise)).toBe(true);
  });

  test("volume controls clamp to a safe range", () => {
    expect(setGameSfxVolume(4)).toBe(1);
    expect(setGameSfxVolume(-2)).toBe(0);
    expect(setGameSfxVolume(0.75)).toBeCloseTo(0.75);
  });

  test("audio functions fail safely when Web Audio is unavailable", () => {
    expect(unlockGameAudio()).toBeNull();
    expect(playGameSfx(GAME_SFX.SWORD)).toBe(false);
  });

  test("unknown sound IDs have no pattern", () => {
    expect(sfxPatternFor("unknown")).toEqual([]);
  });
});
