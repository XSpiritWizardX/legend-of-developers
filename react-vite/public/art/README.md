# Reusable game art

Place image files in these folders:

```text
art/
  tiles/
  props/
  buildings/
  enemies/
  characters/
  items/
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
  items: {
    htmlSword: { source: "/art/items/html-sword.png" },
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
| `ch` | technology dungeon chest | solid |
| `po` | breakable dungeon pot | solid |
| `qc` | reinforced dungeon crate | solid |
| `tm` | interactive dungeon terminal | solid |
| `tp` | dungeon spike trap | walkable |
| `dn` | descending dungeon stairs | walkable |
| `pg` | active dungeon portal | walkable |

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

Dungeon prop IDs are `dungeonChest`, `dungeonPot`, `dungeonCrate`,
`dungeonTerminal`, `dungeonSpikeTrap`, `dungeonStairs`, and
`dungeonPortal`.

## Player animation sheets

Player sheets live in `art/characters` and are indexed in the `characters`
catalog as `playerWalk`, `playerAttack`, `playerItemUse`, `playerHurt`, and
`playerFall`.

Every sheet is 1256×1256 pixels with a 4×4 grid of exact 314×314 cells.
Rows are always `down`, `left`, `right`, `up`; columns are animation frames
from left to right. The catalog stores the grid, timing, and loop metadata.

To draw a cataloged animation frame:

```js
drawCatalogArt(
  ctx,
  "characters",
  "playerWalk",
  x,
  y,
  64,
  64,
  { direction: "left", frame: 2 },
);
```

Omit `frame` to use catalog timing automatically. Non-looping sheets hold on
their final frame when an increasing frame number is supplied.

## NPC characters

Reusable NPC IDs in the `characters` catalog are:

| ID | Role |
| --- | --- |
| `villagerGardener` | forest/village gardener |
| `villagerMechanic` | village mechanic |
| `merchantTraveler` | traveling supply merchant |
| `merchantTechnician` | technology-parts merchant |
| `questArchivist` | archive keeper and lore quest giver |
| `questNetworkScout` | exploration and network quest giver |

Place an NPC in any room like another asset:

```js
assets: [
  { type: "villagerGardener", x: 5, y: 4 },
  { type: "questNetworkScout", x: 10, y: 6, solid: true },
],
```

Room rendering automatically searches the props, characters, and buildings
catalogs, so `category: "characters"` is optional.

## Enemy sprites

Enemy artwork is indexed by the `type` used in a room's `enemies` array:

| Enemy type | Area | Artwork |
| --- | --- | --- |
| `forestByteBeetle` | forest | leaf-armored circuit beetle |
| `caveEchoBat` | caves | cyan-marked sonar bat |
| `desertSandSkitter` | desert | crystal-tailed sand skitter |
| `waterCurrentBlob` | water/coast | current-powered amphibious blob |
| `dungeonFirewallDrone` | dungeons | shielded security drone |

Place any of them directly in a room file:

```js
enemies: [
  { id: "7F-beetle-1", type: "forestByteBeetle", x: 5, y: 4 },
  { id: "7F-beetle-2", type: "forestByteBeetle", x: 11, y: 6 },
],
```

The short legacy types `slime`, `bat`, and `guard` now display the current
blob, echo bat, and firewall drone artwork respectively. Enemy AI, health,
damage, and respawning continue to come from the game engine; the catalog ID
only selects the reusable PNG.

### Miniboss and dungeon bosses

| Enemy type | Role |
| --- | --- |
| `minibossNullKnight` | reusable armored miniboss |
| `bossCacheColossus` | mainframe dungeon boss |
| `bossFluxSovereign` | reactor dungeon boss |
| `bossRootWarden` | server-core dungeon boss |

The three included dungeons already use their matching boss types. Boss and
miniboss types are persistent: once defeated, they stay defeated in that save
and unlock their reward chest. The legacy `knight`, `boss`, and `mage` names
remain indexed for custom rooms created before this art pack.

## Weapons and tools

The first reusable equipment icons use the same IDs as player inventory data:

| Item ID | Artwork |
| --- | --- |
| `htmlSword` | bracket-guard circuit sword |
| `boomerang` | JS callback throwing drone |
| `bow` | CSS energy pulsecaster |
| `bombs` | armored code bomb |
| `hookshot` | API grappling launcher |
| `fireRod` | Firewall Breaker |
| `iceRod` | Freeze Debugger |
| `hammer` | Refactor Hammer |
| `lantern` | Dark Mode Lamp |
| `mirror` | Git Revert mirror |
| `cape` | VPN Cloak |
| `medallion` | Root Access Medallion |
| `devJacket` | Dev Jacket |
| `shield` | Debug Shield |
| `glove` | Power Gloves |
| `boots` | Speed Boots |

Draw an inventory or pickup icon anywhere with:

```js
drawCatalogArt(ctx, "items", "htmlSword", x, y, 64, 64);
```

The loadout menu automatically displays these icons when their corresponding
items have been acquired. Catalog IDs intentionally match inventory IDs, so no
translation table is needed when drawing a selected item. Passive jacket,
shield, glove, and boot slots also display their acquired artwork.

## Projectiles and combat effects

Reusable IDs in the `effects` catalog are:

| Effect ID | Runtime use |
| --- | --- |
| `cssPulse` | pulsecaster projectile |
| `codeExplosion` | code bomb detonation |
| `htmlSlash` | sword attack arc |
| `firewallBurst` | fire rod burst |
| `freezeBurst` | ice rod burst |
| `rootSurge` | Root Access medallion surge |

The game renderer uses these PNGs automatically while retaining the existing
effect timing, movement, damage, and fallback drawing. Custom effects can use
the same catalog call:

```js
drawCatalogArt(ctx, "effects", "freezeBurst", x, y, 128, 128);
```

## Interface artwork

The `ui` catalog includes the live HUD, dialogue, menu, and map pieces:

| UI ID | Use |
| --- | --- |
| `heartFull` | filled health unit |
| `heartEmpty` | depleted health unit |
| `magicMeterFrame` | transparent-center magic meter bezel |
| `creditToken` | currency icon |
| `accessKey` | dungeon key icon |
| `itemSlotFrame` | transparent-center equipped-item slot |
| `dialogueFrame` | transparent-center message and dialogue bezel |
| `menuPanelFrame` | reusable shop, gear, and status panel bezel |
| `mapRoomFrame` | map viewport and room-screen bezel |
| `mapMarkerPlayer` | current player position marker |
| `mapMarkerCache` | unopened cache marker |
| `mapMarkerShop` | code-shop marker |
| `selectionCursor` | active menu-row cursor |

The renderer places live content beneath the transparent frames and uses the
markers and cursor throughout the current interface. Every entry remains
available for custom room overlays through:

```js
drawCatalogArt(ctx, "ui", "mapMarkerCache", x, y, 30, 30);
```
