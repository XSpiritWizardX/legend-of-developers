import room from "./room-1-1";

const SOLID_PERIMETER_CODES = new Set(["tr", "bu", "rk", "lg"]);

function rowCodes(row) {
  if (row.includes(" ")) return row.trim().split(/\s+/);
  return [...row];
}

function codeAt(x, y) {
  return rowCodes(room.walls[y])[x];
}

function solidCode(code) {
  return SOLID_PERIMETER_CODES.has(code);
}

describe("Willowbrook authored perimeter", () => {
  test("north and south roads remain open", () => {
    expect(codeAt(7, 0)).toBe("..");
    expect(codeAt(8, 0)).toBe("..");
    expect(codeAt(7, 9)).toBe("..");
    expect(codeAt(8, 9)).toBe("..");
  });

  test("east and west roads remain open", () => {
    expect(codeAt(0, 4)).toBe("..");
    expect(codeAt(0, 5)).toBe("..");
    expect(codeAt(15, 4)).toBe("..");
    expect(codeAt(15, 5)).toBe("..");
  });

  test("all other perimeter positions are solid", () => {
    for (let x = 0; x < 16; x += 1) {
      if (![7, 8].includes(x)) {
        expect(solidCode(codeAt(x, 0))).toBe(true);
        expect(solidCode(codeAt(x, 9))).toBe(true);
      }
    }
    for (let y = 0; y < 10; y += 1) {
      if (![4, 5].includes(y)) {
        expect(solidCode(codeAt(0, y))).toBe(true);
        expect(solidCode(codeAt(15, y))).toBe(true);
      }
    }
  });

  test("perimeter deliberately mixes multiple environmental materials", () => {
    const perimeter = [
      ...rowCodes(room.walls[0]),
      ...rowCodes(room.walls[9]),
      ...room.walls.slice(1, 9).flatMap((row) => {
        const codes = rowCodes(row);
        return [codes[0], codes[15]];
      }),
    ].filter((code) => code !== "..");
    expect(new Set(perimeter)).toEqual(SOLID_PERIMETER_CODES);
  });
});
