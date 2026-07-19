# Reusable game art

Place image files in these folders:

```text
art/
  tiles/
  props/
  buildings/
  enemies/
  characters/
  effects/
  ui/
```

PNG and WebP are recommended. Transparent PNG works well for props, enemies,
characters, and effects. Tile images should normally be 64×64 pixels.

Register an image once in `src/components/Game/art/artCatalog.js`. Tile codes
also belong in `src/components/Game/art/tileIndex.js`:

```js
export const ART_CATALOG = {
  tiles: {
    rk: { source: "/art/tiles/rock.png" },
  },
  props: {
    appleTree: {
      source: "/art/props/apple-tree.png",
      width: 96,
      height: 96,
      offsetX: -16,
      offsetY: -32,
    },
  },
  enemies: {
    slime: { source: "/art/enemies/slime.png", width: 64, height: 64 },
  },
  characters: {
    playerDown: { source: "/art/characters/player-down.png" },
  },
  effects: {},
  ui: {},
};
```

```js
export const TILE_INDEX = {
  rk: { tile: "mountain", solid: true },
};
```

Use the two-character code in any room. Codes may be space-separated for
readability:

```js
walls: [
  "## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##",
  "## .. .. .. .. .. .. .. .. .. .. .. .. .. .. ##",
  "## .. rk .. .. rk .. .. .. .. rk .. .. .. .. ##",
  "## .. .. .. .. .. .. .. .. .. .. .. .. .. .. ##",
  ".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",
  ".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",
  "## .. .. .. .. .. .. .. .. .. .. .. .. .. .. ##",
  "## .. rk .. .. .. .. .. .. .. .. rk .. .. .. ##",
  "## .. .. .. .. .. .. .. .. .. .. .. .. .. .. ##",
  "## ## ## ## ## ## ## .. .. ## ## ## ## ## ## ##",
]
```

Every `rk` draws the same cached `rock.png` and uses the indexed collision
setting.

After registration, use the catalog ID anywhere:

```js
assets: [
  { type: "appleTree", x: 3, y: 2 },
  { type: "appleTree", x: 11, y: 6 },
  { category: "buildings", type: "villageHouse", x: 8, y: 4 },
]
```

The image is loaded once, cached, and reused everywhere. If an image is absent
or still loading, the game keeps rendering its built-in fallback artwork.

## Included forest and village codes

Use these directly in a room's `floor` or `walls` rows:

| Code | Asset | Collision |
| --- | --- | --- |
| `gr` | grass | walkable |
| `pt` | dirt path | walkable |
| `rk` | mossy rock | solid |
| `tr` | forest tree | solid |
| `bu` | bush | solid |
| `fl` | flowers | walkable |
| `ms` | mushrooms | walkable |
| `sp` | stump | solid |
| `lg` | fallen log | solid |
| `tg` | tall grass | walkable |
| `cf` | cliff | solid |
| `le` | ledge | solid |
| `ss` | stone stairs | walkable |
| `dw` | deep water | solid |
| `sw` | shallow water | walkable |
| `br` | bridge | walkable |
| `vh` | village house | solid |
| `vs` | village shop | solid |
| `fn` | fence | solid |
| `sg` | signpost | solid |
| `lp` | village lamp | solid |
| `wl` | village well | solid |
| `ds` | desert sand | walkable |
| `ck` | cracked desert hardpan | walkable |
| `du` | desert dune ridge | solid |
| `dc` | desert sandstone cliff | solid |
| `ca` | flowering desert cactus | solid |
| `db` | dry desert bush | solid |
| `bn` | desert bone pile | walkable |
| `dr` | red sandstone boulder | solid |
| `ru` | ancient desert ruin | solid |
| `oa` | desert oasis | solid |
| `sh` | sand-to-sea shoreline | walkable |
| `ow` | animated open water | solid |
| `fm` | coastal foam overlay | solid |
| `re` | shoreline reeds | walkable |
| `dk` | vertical wooden dock | walkable |
| `bt` | coastal sailboat | solid |
| `wf` | waterfall | solid |
| `ly` | lily-pad cluster | walkable |
| `co` | coral cluster | solid |
| `cv` | natural cave floor | walkable |
| `cw` | natural cave wall | solid |
| `cp` | bottomless cave pit | solid |
| `cm` | stalagmite cluster | solid |
| `cb` | cave bone pile | walkable |
| `ct` | cave wall torch | walkable |
| `xf` | crystal-cavern floor | walkable |
| `xw` | crystal-cavern wall | solid |
| `xs` | small crystal cluster | solid |
| `xl` | large crystal formation | solid |
| `mf` | mainframe circuit floor | walkable |
| `mw` | mainframe server wall | solid |
| `rf` | reactor heat-plate floor | walkable |
| `rw` | reactor thermal wall | solid |
| `sf` | server access-panel floor | walkable |
| `sv` | server-bay wall | solid |
| `dd` | closed dungeon door | solid |
| `dl` | locked dungeon door | solid |
| `eb` | energy barrier | solid |
| `ps` | pressure switch | walkable |
| `gs` | guardian statue | solid |
| `pi` | dungeon support pillar | solid |

For precise placement, use the long catalog IDs in `assets`. Village examples
are `villageFence`, `villageSign`, `villageLamp`, and `villageWell`; houses use
the `buildings` category as shown above.

Desert prop IDs for precise placement are `desertCactus`,
`desertDryBush`, `desertBones`, `desertRock`, `desertRuins`, and
`desertOasis`.

Coastal prop IDs are `coastFoam`, `coastReeds`, `coastDock`,
`coastBoat`, `coastWaterfall`, `coastLilyPad`, and `coastCoral`.

Cave prop IDs are `caveStalagmite`, `caveBones`, and `caveTorch`.

Crystal prop IDs are `crystalSmall` and `crystalLarge`.

Dungeon mechanism IDs are `dungeonDoor`, `dungeonLockedDoor`,
`dungeonBarrier`, `dungeonSwitch`, `dungeonStatue`, and `dungeonPillar`.
