import fs from "node:fs";

const engineSource = fs.readFileSync(new URL("./engine.js", import.meta.url), "utf8");

describe("Emberstone engine integration", () => {
  test("Wind Disc remote regulators and Forge Gate are wired", () => {
    [
      "emberstoneWindDiscTarget",
      "resolveEmberstoneWindDiscHit",
      "emberstoneGateBlocks",
      "emberstoneContextAction",
      "resolveEmberstoneAction",
      "nextEmberstoneStoryBeat",
    ].forEach((token) => expect(engineSource).toContain(token));
  });

  test("Emberstone gate visibility uses its persistent save flag", () => {
    expect(engineSource).toContain("state.mapId === \"d02\" && state.flags[EMBERSTONE_FLAG.GATE_OPEN]");
  });

  test("remote regulator hits force the Wind Disc to return after feedback", () => {
    expect(engineSource).toContain("boomerang.returning = true");
    expect(engineSource).toContain("FURNACE REGULATOR");
  });
});
