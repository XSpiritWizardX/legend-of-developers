import { GAME_SFX, playGameSfx, sfxPatternFor, unlockGameAudio } from "./gameAudio";

describe("gameplay sound effects", () => {
  test("core player actions have synthesized sound patterns", () => {
    Object.values(GAME_SFX).forEach((type) => {
      expect(sfxPatternFor(type).length).toBeGreaterThan(0);
    });
  });

  test("pickup and chest cues are short ascending sequences", () => {
    const pickup = sfxPatternFor(GAME_SFX.PICKUP);
    const chest = sfxPatternFor(GAME_SFX.CHEST);
    expect(pickup).toHaveLength(3);
    expect(chest).toHaveLength(3);
    expect(pickup[2].from).toBeGreaterThan(pickup[0].from);
    expect(chest[2].from).toBeGreaterThan(chest[0].from);
  });

  test("sword, fall and throw cues use directional pitch motion", () => {
    const sword = sfxPatternFor(GAME_SFX.SWORD)[0];
    const fall = sfxPatternFor(GAME_SFX.FALL)[0];
    const thrown = sfxPatternFor(GAME_SFX.THROW)[0];
    expect(sword.to).toBeLessThan(sword.from);
    expect(fall.to).toBeLessThan(fall.from);
    expect(thrown.to).toBeLessThan(thrown.from);
  });

  test("audio functions fail safely when Web Audio is unavailable", () => {
    expect(unlockGameAudio()).toBeNull();
    expect(playGameSfx(GAME_SFX.SWORD)).toBe(false);
  });

  test("unknown sound IDs have no pattern", () => {
    expect(sfxPatternFor("unknown")).toEqual([]);
  });
});