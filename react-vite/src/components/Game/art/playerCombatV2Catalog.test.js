import { PLAYER_COMBAT_V2_CATALOG, catalogPlayerCombatArtV2 } from "./playerCombatV2Catalog";

describe("v2 player combat art", () => {
  test("attack art is a four-direction four-frame sheet", () => {
    const attack = catalogPlayerCombatArtV2("characters", "playerAttack");
    expect(attack.source).toBe("/art/v2/characters/player-attack-sheet.svg");
    expect(attack.sheet.framesPerDirection).toBe(4);
    expect(attack.sheet.directions).toEqual(["down", "left", "right", "up"]);
    expect(attack.sheet.frameWidth).toBe(64);
    expect(attack.sheet.frameHeight).toBe(64);
  });

  test("combat catalog stays scoped to character attack art", () => {
    expect(PLAYER_COMBAT_V2_CATALOG.playerAttack.loop).toBe(false);
    expect(catalogPlayerCombatArtV2("ui", "playerAttack")).toBeNull();
    expect(catalogPlayerCombatArtV2("characters", "unknown")).toBeNull();
  });
});