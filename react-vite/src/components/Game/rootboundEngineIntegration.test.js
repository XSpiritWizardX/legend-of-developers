import fs from "node:fs";

const engineSource = fs.readFileSync(new URL("./engine.js", import.meta.url), "utf8");

describe("Rootbound Temple engine integration", () => {
  test("puzzle interactions, gate collision, boss volleys and story beats are wired", () => {
    [
      "rootboundContextAction",
      "resolveRootboundAction",
      "rootboundGateBlocks",
      "nextRootboundStoryBeat",
      "rootboundBossVolley",
      "rootboundBossPhase",
      "drawEnemyProjectiles",
    ].forEach((token) => expect(engineSource).toContain(token));
  });

  test("gameplay audio is actually invoked by the engine", () => {
    expect(engineSource).toContain("unlockGameAudio");
    expect(engineSource).toContain("playGameSfx(GAME_SFX.SWORD)");
    expect(engineSource).toContain("playGameSfx(GAME_SFX.HIT)");
    expect(engineSource).toContain("playGameSfx(GAME_SFX.CHEST)");
  });

  test("boss health bars use the runtime enemy max hp", () => {
    expect(engineSource).toContain("enemy.maxHp || (24 + (map().number || 0) * 4)");
  });
});
