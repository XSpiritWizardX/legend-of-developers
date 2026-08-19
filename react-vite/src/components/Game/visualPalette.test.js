import fs from "node:fs";

const engineSource = fs.readFileSync(new URL("./engine.js", import.meta.url), "utf8");

const RETIRED_NEON_TOKENS = [
  "#42e9ff",
  "#3fdff5",
  "#d7fbff",
  "#42efd4",
  "#f02ea5",
  "#d52f9a",
  "#12dcc2",
  "#11bda8",
  "#5a2a80",
  "#41205f",
  "#ffd45e",
  "#ff9b45",
  "#fff1a3",
  "rgba(190,249,255,",
  "rgba(55,224,255,",
  "rgba(255,211,78,",
  "rgba(255,112,45,",
  "rgba(66,239,212,",
  "rgba(240,46,165,",
  "rgba(80,235,255,",
  "rgba(255,80,90,",
];

describe("V2 procedural visual palette", () => {
  test("retired cyber-neon tokens do not re-enter the game renderer", () => {
    RETIRED_NEON_TOKENS.forEach((token) => {
      expect(engineSource).not.toContain(token);
    });
  });
});
