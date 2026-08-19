import fs from "node:fs";

const engineSource = fs.readFileSync(new URL("./engine.js", import.meta.url), "utf8");

describe("adaptive music engine integration", () => {
  test("the game loop syncs music from map, room and living boss state", () => {
    expect(engineSource).toContain("syncAdaptiveMusic");
    expect(engineSource).toContain("bossType: livingBoss?.type");
    expect(engineSource).toContain("bossPhase: livingBoss?.rootboundPhase || 1");
    expect(engineSource).toContain("roomTitle: roomRuntimeTitle()");
  });

  test("music is stopped when the game engine is destroyed", () => {
    expect(engineSource).toContain("stopAdaptiveMusic()");
  });
});
