const overworldModules = import.meta.glob("./overworld/*.js", {
  eager: true,
  import: "default",
});
const dungeonModules = import.meta.glob("./dungeons/**/*.js", {
  eager: true,
  import: "default",
});

function createRegistry(modules) {
  return Object.values(modules).reduce((registry, room) => {
    registry[room.id] = room;
    return registry;
  }, {});
}

const overworldRooms = createRegistry(overworldModules);
const dungeonRooms = createRegistry(dungeonModules);

export function editableRoomAt(mapId, roomX, roomY) {
  const id = `${roomX},${roomY}`;
  return mapId === "overworld" ? overworldRooms[id] : dungeonRooms[`${mapId}:${id}`];
}

export function roomAssetsAt(mapId, roomX, roomY) {
  return editableRoomAt(mapId, roomX, roomY)?.assets || [];
}
