import fs from "fs";

const loaderSource = fs.readFileSync(new URL("./art/artLoader.js", import.meta.url), "utf8");
const engineSource = fs.readFileSync(new URL("./fastTravelEngine.js", import.meta.url), "utf8");

describe("spinning saw integration", () => {
  test("the renderer applies catalog rotation metadata", () => {
    expect(loaderSource).toContain("catalogSpinningSawArt");
    expect(loaderSource).toContain("entry.rotationSpeed");
    expect(loaderSource).toContain("ctx.rotate(rotation)");
  });

  test("the game installs periodic saw definitions before the core engine mounts", () => {
    expect(engineSource).toContain('import { installSpinningSawSpawns } from "./spinningSaw"');
    expect(engineSource).toContain("installSpinningSawSpawns(MAPS)");
  });
});
