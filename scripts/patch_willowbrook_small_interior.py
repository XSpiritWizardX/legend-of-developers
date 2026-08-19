from pathlib import Path

WORLD = Path("react-vite/src/components/Game/world.js")
ENGINE = Path("react-vite/src/components/Game/engine.js")


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected exactly one anchor, found {count}")
    return text.replace(old, new, 1)


world = WORLD.read_text()
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

engine = ENGINE.read_text()
engine = replace_once(
    engine,
    'import {\n  WORLD_OBJECT_KIND, activeWorldObjects, breakableBySword, canLiftWorldObject,\n  facingWorldObject, moveWorldObject, pushDestination, removeWorldObject,\n  worldObjectAtPoint,\n} from "./worldObjects";\n',
    'import {\n  WORLD_OBJECT_KIND, activeWorldObjects, breakableBySword, canLiftWorldObject,\n  facingWorldObject, moveWorldObject, pushDestination, removeWorldObject,\n  worldObjectAtPoint,\n} from "./worldObjects";\nimport {\n  INTERIORS, interiorByMapId, interiorEntranceNear, interiorPixelPosition,\n} from "./interiors";\n',
    "interior imports",
)
engine = replace_once(
    engine,
    '    if (state.mapId === "overworld") {\n      const dungeon = DUNGEONS.find((entry) => Math.hypot(player.x - entry.entrance.x, player.y - entry.entrance.y) < 88);\n',
    '    if (state.mapId === "overworld") {\n      const interior = interiorEntranceNear({\n        mapId: state.mapId, x: player.x, y: player.y, tileSize: TILE, radius: 82,\n      });\n      if (interior) {\n        changeMap(interior.id, interiorPixelPosition(interior.spawn, TILE));\n        announce(`ENTERED ${interior.name.toUpperCase()}`, 2);\n        return;\n      }\n      const dungeon = DUNGEONS.find((entry) => Math.hypot(player.x - entry.entrance.x, player.y - entry.entrance.y) < 88);\n',
    "enter small interior",
)
engine = replace_once(
    engine,
    '    } else if (state.mapId === "debugLab" && Math.hypot(player.x - currentMap.exit.x, player.y - currentMap.exit.y) < 82) {\n',
    '    } else if (interiorByMapId(state.mapId) && Math.hypot(player.x - currentMap.exit.x, player.y - currentMap.exit.y) < 82) {\n      const interior = interiorByMapId(state.mapId);\n      changeMap(interior.returnTo.mapId, interiorPixelPosition(interior.returnTo, TILE));\n      announce(`LEFT ${interior.name.toUpperCase()}`, 1.8);\n      return;\n    } else if (state.mapId === "debugLab" && Math.hypot(player.x - currentMap.exit.x, player.y - currentMap.exit.y) < 82) {\n',
    "exit small interior",
)
engine = replace_once(
    engine,
    '    if (state.mapId === "overworld") {\n      DUNGEONS.forEach((dungeon) => {\n',
    '''    if (state.mapId === "overworld") {
      INTERIORS.forEach((interior) => {
        const entrance = interiorPixelPosition(interior.entrance, TILE);
        const x = screenX(entrance.x);
        const y = screenY(entrance.y);
        if (x < -80 || y < -80 || x > VIEW_W + 80 || y > VIEW_H + 80) return;
        rect(x - 43, y - 28, 86, 55, "#4a4e52");
        rect(x - 35, y - 21, 70, 48, "#292e34");
        rect(x - 25, y - 13, 50, 40, "#05070b");
        rect(x - 39, y - 31, 78, 8, "#777c74");
        rect(x - 34, y - 25, 8, 45, "#62675f");
        rect(x + 26, y - 25, 8, 45, "#62675f");
        text("HOLLOW", x, y + 43, 8, "center", "#d9d3b4");
      });
      DUNGEONS.forEach((dungeon) => {
''',
    "draw small interior entrance",
)
ENGINE.write_text(engine)
