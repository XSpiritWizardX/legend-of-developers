from pathlib import Path

WORLD = Path("react-vite/src/components/Game/world.js")


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected exactly one anchor, found {count}")
    return text.replace(old, new, 1)


world = WORLD.read_text()
world = replace_once(
    world,
    '  {\n    id: "d03", name: "Crystalwater Vault", number: 3, theme: "water",\n    reward: "backendApi", entrance: { x: 136 * TILE + 32, y: 64 * TILE + 32 },\n  },\n];',
    '  {\n    id: "d03", name: "Crystalwater Vault", number: 3, theme: "water",\n    reward: "backendApi", entrance: { x: 136 * TILE + 32, y: 64 * TILE + 32 },\n  },\n  {\n    id: "willowCave", name: "Willowbrook Hollow", number: "H", theme: "cave",\n    reward: null, entrance: { x: 37 * TILE + 32, y: 16 * TILE + 32 },\n  },\n];',
    "small interior entrance",
)
world = replace_once(
    world,
    '  d01: {\n    id: "d01", name: "Temple I · Rootbound Temple", number: 1, theme: "forest",',
    '  willowCave: {\n    id: "willowCave", name: "Willowbrook Hollow", theme: "cave",\n    width: 12, height: 8,\n    spawn: { x: 6 * TILE + 32, y: 6 * TILE + 32 },\n    exit: { x: 6 * TILE + 32, y: 7 * TILE + 32 },\n    enemies: [\n      ["willow-cave-bat", "caveEchoBat", 3, 3],\n      ["willow-cave-beetle", "forestByteBeetle", 9, 4],\n    ],\n    chests: [["willow-cave-cache", 6, 2, "magicPatch"]],\n  },\n  d01: {\n    id: "d01", name: "Temple I · Rootbound Temple", number: 1, theme: "forest",',
    "small interior map",
)
world = replace_once(
    world,
    'function debugLabTile(tx, ty) {\n',
    '''function willowCaveTile(tx, ty) {
  const atEdge = tx === 0 || ty === 0 || tx === 11 || ty === 7;
  if (atEdge) {
    if (ty === 7 && (tx === 5 || tx === 6)) return "dungeonFloor";
    return "wall";
  }
  if ((tx === 3 || tx === 8) && ty === 4) return "wall";
  if (ty === 2 && (tx === 2 || tx === 9)) return "stone";
  return (tx + ty) % 2 ? "dungeonFloor" : "dungeonFloorAlt";
}

function debugLabTile(tx, ty) {
''',
    "small interior tile function",
)
world = replace_once(
    world,
    '  if (mapId === "overworld") return overworldTile(tx, ty, flags);\n  if (mapId === "debugLab") return debugLabTile(tx, ty);\n',
    '  if (mapId === "overworld") return overworldTile(tx, ty, flags);\n  if (mapId === "willowCave") return willowCaveTile(tx, ty);\n  if (mapId === "debugLab") return debugLabTile(tx, ty);\n',
    "small interior tile dispatch",
)
world = replace_once(
    world,
    '  if (mapId === "debugLab") return [];\n',
    '  if (mapId === "debugLab" || mapId === "willowCave") return [];\n',
    "small interior no legacy exits",
)
WORLD.write_text(world)
