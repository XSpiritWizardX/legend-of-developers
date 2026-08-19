# Variable-size world and room layout

Legend of Developers is moving away from treating every camera screen as a room.

Historically, the engine used a 16x10-tile screen as both the camera viewport and the room boundary. That was easy to author, but it made every interior, dungeon chamber, village, clearing, and boss arena feel the same size.

The new model separates four concepts:

1. **World coordinates** - persistent tile/pixel positions used by saves, enemies, chests, and traversal.
2. **Logical rooms** - authored rectangular spaces with independent width/height.
3. **Regions** - broad outdoor areas that may contain several rooms or landmarks.
4. **Camera zones** - rules describing how the viewport behaves while the player occupies a logical room.

## Supported room scales

Room geometry is not restricted to presets, but the design vocabulary includes:

| Scale | Suggested tiles | Typical use |
| --- | --- | --- |
| Tiny | 8x6 | hut, secret room, cave pocket |
| Small | 12x8 | house, shop, puzzle chamber |
| Standard | 16x10 | legacy screen, compact dungeon room |
| Medium | 24x12 | shrine, long hall, combat room |
| Large | 32x20 | village square, boss arena, multi-part puzzle |
| Great hall | 48x20 | major dungeon hall or set piece |

These are guidelines rather than hard limits. A room may be 10x18, 40x12, or another authored rectangle when the level design calls for it.

## Camera modes

`roomGeometry.js` defines four camera behaviors:

- `snap` - lock to the room origin/center like a classic single-screen chamber.
- `locked` - fixed camera for small interiors or staged encounters.
- `clampedFollow` - follow the player inside the room while never revealing beyond its bounds.
- `follow` - free follow for special outdoor/set-piece use.

Small rooms may be centered within the existing 1024x640 viewport. Large rooms can scroll smoothly while retaining authored boundaries.

## World layout registry

`worldLayout.js` defines logical spaces independently of the old screen grid. A room has:

```js
{
  id: "d01-grand-nave",
  name: "Rootbound Grand Nave",
  bounds: { x: 16, y: 0, width: 32, height: 10 },
  camera: "clampedFollow",
  kind: "wideHall",
}
```

Bounds are in tiles and continue using the existing 64-pixel world tile size. This preserves player coordinates and save compatibility while changing how the world is divided and presented.

## Rootbound Temple migration example

The first dungeon's existing 48x30-tile map is now described by four logical rooms instead of nine identical 16x10 screens:

```text
+----------------+--------------------------------+
| West Gallery   | Grand Nave                     |
| 16x10          | 32x10                          |
+------------------------+------------------------+
| Lower Crypt            | Rootbound Sanctum      |
| 24x20                  | 24x20                  |
|                        |                        |
+------------------------+------------------------+
```

The underlying map dimensions do not change. Only the authored room partition and camera behavior change, which lets this migration happen without invalidating saved world coordinates.

## Overworld model

Outdoor world design uses broad **regions** with smaller authored spaces layered inside them. For example, Greenwood Vale may scroll as a large outdoor region while Hero's Grove behaves as a tighter authored clearing and Willowbrook Village uses a larger 32x20 camera zone.

This allows the overworld to contain:

- narrow forest corridors
- tiny caves and houses
- wide villages
- tall cliff/ascent areas
- large fields
- irregular-feeling paths built from overlapping visual terrain even though collision rooms remain rectangular initially

A later phase can add polygonal/compound camera zones if a particular outdoor area needs non-rectangular bounds.

## Compatibility strategy

`logicalRoomAtTile()` falls back to a generated legacy 16x10 room when no new logical room or region owns a coordinate. This is intentional: redesigning a world this large should be incremental.

The migration path is:

1. Keep existing world coordinates and save format.
2. Add logical room metadata around selected areas.
3. Make the camera consult logical rooms instead of fixed screen indices.
4. Re-author terrain, exits, encounters, and interactions inside those rooms.
5. Expand coverage until the legacy fallback is no longer needed.

## Connection model

Room size and room connection are separate concerns. Connections should ultimately be authored portals/edges such as:

```js
{
  from: "d01-lower-crypt",
  to: "d01-root-sanctum",
  edge: "east",
  span: { start: 8, length: 3 },
  transition: "seamless",
}
```

That permits doors to occupy only part of a wall, allows rooms with unequal dimensions to connect cleanly, and supports stairs, caves, interior doors, cliff drops, teleports, and dungeon transitions without assuming neighboring rooms have matching screen coordinates.

## Design goal

The player should stop perceiving the world as a checkerboard of same-sized screens. Room dimensions, camera behavior, terrain elevation, traversal mechanics, encounter density, and environmental interactions should combine to make each location feel authored for its purpose.
