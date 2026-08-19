import {
  INTERIORS,
  interiorByMapId,
  interiorEntranceNear,
  interiorPixelPosition,
} from "./interiors";

describe("small interior portal contract", () => {
  test("Willowbrook Hollow is genuinely smaller than the 16x10 viewport", () => {
    const hollow = interiorByMapId("willowCave");
    expect(hollow.size).toEqual({ width: 12, height: 8 });
    expect(hollow.size.width).toBeLessThan(16);
    expect(hollow.size.height).toBeLessThan(10);
  });

  test("entrance discovery is scoped to the overworld entrance", () => {
    const entrance = INTERIORS[0].entrance;
    const point = interiorPixelPosition(entrance);
    expect(interiorEntranceNear({ mapId: "overworld", ...point })?.id).toBe("willowCave");
    expect(interiorEntranceNear({ mapId: "d01", ...point })).toBeNull();
  });

  test("return position is just outside the authored entrance", () => {
    const hollow = interiorByMapId("willowCave");
    expect(hollow.returnTo).toEqual({ mapId: "overworld", tx: 37, ty: 17 });
  });
});
