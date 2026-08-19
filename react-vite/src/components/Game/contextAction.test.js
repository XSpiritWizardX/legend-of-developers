import { contextActionLabel, contextActionText } from "./contextAction";

describe("contextual action prompts", () => {
  test("carried objects prioritize the throw prompt", () => {
    expect(contextActionLabel({ carried: true, dungeon: true })).toEqual({ key: "L", label: "THROW" });
  });

  test("world objects expose lift, push, and cut actions", () => {
    expect(contextActionLabel({ worldObject: { kind: "pot" }, canLift: true })).toEqual({ key: "L", label: "LIFT" });
    expect(contextActionLabel({ worldObject: { pushable: true }, canLift: false })).toEqual({ key: "L", label: "PUSH" });
    const cut = contextActionLabel({ worldObject: { cuttable: true }, canLift: false });
    expect(cut).toEqual({ key: "H", label: "CUT" });
    expect(contextActionText(cut)).toBe("H · CUT");
  });

  test("world interactions expose clear verbs", () => {
    expect(contextActionLabel({ dungeon: true })).toEqual({ key: "L", label: "ENTER" });
    expect(contextActionLabel({ merchant: true })).toEqual({ key: "L", label: "TALK" });
    expect(contextActionLabel({ exit: true })).toEqual({ key: "L", label: "EXIT" });
    expect(contextActionLabel({ chest: true })).toEqual({ key: "L", label: "OPEN" });
  });

  test("prompt text stays compact", () => {
    expect(contextActionText({ key: "L", label: "OPEN" })).toBe("L · OPEN");
    expect(contextActionText(null)).toBe("");
  });
});