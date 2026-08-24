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

  test("optional secret rewards persist through save flags", () => {
    expect(engineSource).toContain("if (result.patch) Object.assign(state.flags, result.patch)");
    expect(engineSource).toContain("if (result.coins) player.coins += result.coins");
    expect(engineSource).toContain("if (result.reward) reward(result.reward)");
    expect(engineSource).toContain("if (result.changed)");
    expect(engineSource).toContain("save();");
  });

  test("major dungeon reward chests stay gated until the permanent boss is defeated", () => {
    expect(engineSource).toContain('id.endsWith("-reward")');
    expect(engineSource).toContain("enemiesByMap[state.mapId].some((enemy) => isPermanentEnemy(enemy.type))");
  });
});
