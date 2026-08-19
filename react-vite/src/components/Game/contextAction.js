export function contextActionLabel({
  carried = false,
  worldObject = null,
  canLift = false,
  dungeon = false,
  merchant = false,
  exit = false,
  chest = false,
} = {}) {
  if (carried) return { key: "L", label: "THROW" };
  if (worldObject) {
    if (canLift) return { key: "L", label: "LIFT" };
    if (worldObject.pushable) return { key: "L", label: "PUSH" };
    if (worldObject.cuttable) return { key: "H", label: "CUT" };
  }
  if (dungeon) return { key: "L", label: "ENTER" };
  if (merchant) return { key: "L", label: "TALK" };
  if (exit) return { key: "L", label: "EXIT" };
  if (chest) return { key: "L", label: "OPEN" };
  return null;
}

export function contextActionText(action) {
  return action ? `${action.key} · ${action.label}` : "";
}
