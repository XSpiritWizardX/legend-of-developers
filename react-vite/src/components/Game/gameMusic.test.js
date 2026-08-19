import {
  MUSIC_SCENE,
  midiToFrequency,
  musicProfileFor,
  musicSceneFor,
  stopAdaptiveMusic,
  syncAdaptiveMusic,
} from "./gameMusic";

describe("adaptive game music", () => {
  test("overworld room names select distinct ambient identities", () => {
    expect(musicSceneFor({ mapId: "overworld", roomTitle: "Willowbrook Village" })).toBe(MUSIC_SCENE.VILLAGE);
    expect(musicSceneFor({ mapId: "overworld", roomTitle: "Whispering Wood" })).toBe(MUSIC_SCENE.FOREST);
    expect(musicSceneFor({ mapId: "overworld", roomTitle: "Silverwater Reach" })).toBe(MUSIC_SCENE.WATER);
    expect(musicSceneFor({ mapId: "overworld", roomTitle: "Sunscar Desert" })).toBe(MUSIC_SCENE.DESERT);
    expect(musicSceneFor({ mapId: "overworld", roomTitle: "Crystal Highlands" })).toBe(MUSIC_SCENE.MOUNTAIN);
    expect(musicSceneFor({ mapId: "overworld", roomTitle: "Everdawn Fields" })).toBe(MUSIC_SCENE.FIELDS);
  });

  test("dungeons receive dedicated scenes independent of room names", () => {
    expect(musicSceneFor({ mapId: "d01", roomTitle: "Keeper's Key" })).toBe(MUSIC_SCENE.TEMPLE);
    expect(musicSceneFor({ mapId: "d02", mapTheme: "fire" })).toBe(MUSIC_SCENE.FIRE_TEMPLE);
    expect(musicSceneFor({ mapId: "d03", mapTheme: "water" })).toBe(MUSIC_SCENE.WATER_TEMPLE);
    expect(musicSceneFor({ mapId: "willowCave", mapTheme: "cave" })).toBe(MUSIC_SCENE.CAVE);
    expect(musicSceneFor({ mapId: "debugLab" })).toBe(MUSIC_SCENE.SILENT);
  });

  test("living bosses override ambient scenes", () => {
    expect(musicSceneFor({ mapId: "d01", bossType: "bossCacheColossus" })).toBe(MUSIC_SCENE.ROOTBOUND_BOSS);
    expect(musicSceneFor({ mapId: "d02", bossType: "bossFluxSovereign" })).toBe(MUSIC_SCENE.BOSS);
  });

  test("Rootbound phase two increases musical urgency without changing identity", () => {
    const phaseOne = musicProfileFor(MUSIC_SCENE.ROOTBOUND_BOSS, 1);
    const phaseTwo = musicProfileFor(MUSIC_SCENE.ROOTBOUND_BOSS, 2);
    expect(phaseTwo.barSeconds).toBeLessThan(phaseOne.barSeconds);
    expect(phaseTwo.gain).toBeGreaterThan(phaseOne.gain);
    expect(phaseTwo.bars[0].length).toBeGreaterThan(phaseOne.bars[0].length);
  });

  test("pitch conversion remains anchored to concert A", () => {
    expect(midiToFrequency(69)).toBeCloseTo(440);
    expect(midiToFrequency(57)).toBeCloseTo(220);
  });

  test("runtime sync fails safely before browser audio is unlocked", () => {
    stopAdaptiveMusic();
    expect(syncAdaptiveMusic({ mapId: "overworld", roomTitle: "Willowbrook Village" })).toBe(false);
  });
});
