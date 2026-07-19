# Room editing

The overworld is a 16×16 grid of 256 playable screens. Columns are labeled
`1–16`, rows are labeled `A–P`, and every 16×10 screen has its own data file:

- `overworld/room-X-Y.js` contains an overworld room.
- `dungeons/d01`, `d02`, and `d03` contain each dungeon's nine rooms.

Coordinates start at `{ x: 0, y: 0 }` in the upper-left and end at
`{ x: 15, y: 9 }` in the lower-right.

Room filenames use zero-based engine coordinates. For example,
`room-0-0.js` is map room `1A`, `room-15-0.js` is `16A`, and
`room-15-15.js` is `16P`.

## Floor and wall tiles

Rooms use separate `floor` and `walls` layers. This lets you repaint the ground
without moving walls, enemies, chests, or decorative assets. Each layer must
contain exactly 10 strings, and every string must contain exactly 16
characters.

```js
export default {
  id: "1A",

  floor: [
    "gggggggggggggggg",
    "gggggggggggggggg",
    "ggppppppppppgggg",
    "ggppppppppppgggg",
    "ggpppppppppppppp",
    "ggpppppppppppppp",
    "ggppppppppppgggg",
    "ggppppppppppgggg",
    "gggggggggggggggg",
    "gggggggggggggggg",
  ],

  walls: [
    "################",
    "#..............#",
    "#..............#",
    "#..............#",
    "................",
    "................",
    "#..............#",
    "#..............#",
    "#..............#",
    "#######..#######",
  ],

  assets: [],
  enemies: [],
  chests: [],
};
```

Floor characters:

- `g` — grass
- `p` — paved path
- `s` — stone
- `d` — dirt
- `a` — sand
- `w` — shallow water
- `b` — bridge
- `f` — dungeon floor
- `m` — metal floor
- `v` — void

Wall characters:

- `.` — no wall
- `#` — solid wall
- `T` — solid tree
- `R` — solid rock
- `~` — deep water
- `D` — locked door
- `B` — switch-controlled barrier

## Place assets

Add objects to a room's `assets` array:

```js
export default {
  id: "1,1",
  assets: [
    { type: "serverRack", x: 3, y: 2 },
    { type: "terminal", x: 5, y: 2, color: "#32496b" },
    { type: "neonSign", x: 8, y: 3, text: "HELLO", color: "#61235f" },
    { type: "dataPlant", x: 12, y: 6 },
  ],
};
```

Available asset types are `serverRack`, `terminal`, `neonSign`, `codeCrate`,
`dataPlant`, `streetLamp`, `bench`, `holoTable`, `pipeCluster`, and
`debugStatue`, plus `cyberTree`, `boulder`, `fountain`, `marketStall`,
`satelliteDish`, `solarPanel`, `windTurbine`, `dumpster`, `flowerPatch`, and
`obelisk`.

Most props block movement. Set `solid: false` to make one decorative or
`solid: true` to force collision. `color` changes its main accent, and
`neonSign` accepts custom `text`.

Dungeon room files also accept `wallRects`. Each rectangle uses
`[x, y, width, height]` in local tile coordinates:

```js
export default {
  id: "d01:0,0",
  variant: 0,
  wallRects: [
    [2, 2, 4, 2],
    [10, 6, 4, 2],
  ],
  assets: [],
};
```

Setting `variant: 0` disables the old procedural obstacle pattern so the
room's `wallRects` become its authored interior layout.

Keep exits clear: west/east exits occupy local rows 4–5, while north/south
exits occupy local columns 7–8.

## Complete room example

All room-specific content belongs in the same file:

```js
export default {
  id: "1A",
  name: "Legacy Code Wilds",

  floor: [
    "gggggggggggggggg",
    "gggggggggggggggg",
    "ggggggppgggggggg",
    "ggggggppgggggggg",
    "pppppppppppppppp",
    "pppppppppppppppp",
    "ggggggppgggggggg",
    "ggggggppgggggggg",
    "ggggggppgggggggg",
    "ggggggppgggggggg",
  ],

  walls: [
    "################",
    "#..............#",
    "#.T.........T..#",
    "#..............#",
    "................",
    "................",
    "#..............#",
    "#..R...........#",
    "#..............#",
    "#######..#######",
  ],

  assets: [
    { type: "terminal", x: 4, y: 3 },
    { type: "neonSign", x: 11, y: 2, text: "1A", solid: false },
  ],

  enemies: [
    { id: "1A-slime-1", type: "slime", x: 9, y: 6 },
  ],

  chests: [
    { id: "1A-cache", x: 12, y: 7, reward: "bombs" },
  ],

  merchants: [],
  entrances: [],
  exits: ["east", "south"],
  triggers: [],
};
```

Tile and object coordinates are local to the room. Changing one room file
should never require converting its positions into full-world coordinates.

## Reusable image artwork

Uploaded artwork belongs in `react-vite/public/art`. Register each image once
in `src/components/Game/art/artCatalog.js`, then reuse its catalog ID in any
number of rooms. Tiles, props, enemies, and player-direction images support
catalog artwork and fall back to the built-in pixel drawing when no image is
registered.

See [`../../../../public/art/README.md`](../../../../public/art/README.md) for the
folder layout, image recommendations, catalog example, sizing, and offsets.
