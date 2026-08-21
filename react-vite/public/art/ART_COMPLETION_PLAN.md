# Legend of Developers — Art Completion Plan

This file is the production definition of done for the game's visual pass. Work proceeds top-to-bottom; a section is only marked complete when its assets are integrated into playable rooms rather than merely generated.

## 1. Rendering foundation
- [x] 64x64 reusable tile convention
- [x] Catalog-driven reusable art loader
- [x] Cardinal N/E/S/W neighbor-mask autotile resolver
- [x] 16-state sprite-sheet autotile rendering
- [x] Collision/gameplay meaning separated from visual tile selection
- [x] Source-rectangle rendering for packed tile sheets
- [x] Overhead/foreground scenery vocabulary for canopies, cliff lips, arches, and hanging roots
- [ ] General first-class background / world / foreground render-layer field in engine
- [ ] Animated autotile family support where appropriate
- [ ] Deterministic decorative tile variants to break repetition

## 2. Forest and Willowbrook
- [x] Forest ground 16-state autotile family
- [x] Dirt path 16-state autotile family
- [x] Forest cliff 16-state autotile family
- [x] Forest canopy foreground art
- [x] Forest cliff-lip foreground art
- [x] Willowbrook Village room composition
- [x] Eastwind Meadow room composition
- [x] Applewood Orchard room composition
- [x] Millpond Crossing room composition
- [ ] Dedicated bridge approach/end-cap tiles
- [ ] Additional grass/path decorative variants
- [ ] Remaining Greenwood Vale / Hero's Grove / Oldgrowth room-by-room pass

## 3. Rootbound Temple
- [x] Rootbound floor 16-state autotile family
- [x] Rootbound wall 16-state autotile family
- [x] Rootbound arch foreground art
- [x] Rootbound hanging-root foreground art
- [x] Temple Threshold production composition
- [x] Four-Root Hall production composition
- [x] Keeper's Key production composition
- [x] Heartroot Sanctum production composition
- [ ] Remaining Rootbound rooms production pass
- [ ] Broken masonry / floor crack variants
- [ ] Root growth variants
- [ ] Crystal growth overlays
- [ ] Door/arch transition set

## 4. Desert
- [x] Sand autotile family
- [x] Cracked ground autotile family
- [x] Sandstone cliff autotile family
- [x] Dune edge family
- [ ] Ruin foreground/arch pieces
- [ ] Oasis transition set
- [ ] Desert room-by-room production pass
- [x] Representative production slice: Amber Wastes Fallen Gate
- [x] Representative production slice: Glassspring Oasis
- [x] Representative production slice: Sunscar Broken Colonnade
- [x] Representative production slice: Sunscar Caravan Scar

## 5. Coast and water
- [x] Shoreline autotile family
- [x] Open/deep water autotile family
- [x] Shallow-water transition family
- [ ] Animated water variants
- [x] Foam overlays integrated into production rooms
- [ ] Dock/bridge approach pieces
- [ ] Waterfall foreground/background layering
- [ ] Coast room-by-room production pass
- [x] Representative production slice: Gullhook Cove
- [x] Representative production slice: Tideglass Channel
- [x] Representative production slice: Breaker Pier
- [x] Representative production slice: Rainfall Shelf

## 6. Cave and crystal
- [x] Cave floor autotile family
- [x] Cave wall autotile family
- [ ] Pit edge/corner family
- [x] Crystal floor autotile family
- [x] Crystal wall autotile family
- [ ] Stalactite / ceiling foreground pieces
- [ ] Crystal glow overlays
- [ ] Cave/crystal room-by-room production pass

## 7. Remaining dungeon themes
- [ ] Reactor tiles and structural variants
- [ ] Server-core tiles and structural variants
- [ ] Fire theme
- [ ] Water theme
- [ ] Shadow / void theme
- [ ] Ice theme
- [ ] Desert dungeon theme
- [ ] Light / storm / sky / royal themes actually used by maps
- [ ] Theme-specific doors, pillars, floors, walls, corners, hazards, and foreground pieces

## 8. Structures and props
- [ ] Village building architecture consistency pass
- [ ] Fences, gates, signs, lamps, wells
- [ ] Dungeon doors, locked doors, barriers, switches
- [ ] Chests, pots, crates, terminals
- [ ] Bridges, docks, boats, ruins
- [ ] Vegetation, rocks, roots, reeds, coral
- [ ] Prop shadow and collision-readability pass

## 9. Characters and enemies
- [ ] Player animation visual consistency audit
- [ ] NPC visual consistency audit
- [ ] Merchant and quest-character pass
- [ ] Forest enemy pass
- [ ] Cave enemy pass
- [ ] Desert enemy pass
- [ ] Water enemy pass
- [ ] Dungeon enemy pass
- [ ] Miniboss pass
- [ ] Boss silhouette / animation / hit-state pass

## 10. Items, combat art, and VFX
- [ ] Equipment icon consistency audit
- [ ] Pickup art pass
- [ ] Sword trails and impacts
- [ ] Projectile effects
- [ ] Bomb/explosion effects
- [ ] Fire / ice effects
- [ ] Root / crystal effects
- [ ] Portal and environmental effects
- [ ] Boss phase effects

## 11. UI and presentation
- [ ] HUD consistency audit
- [ ] Inventory/equipment presentation
- [ ] Dialogue and interaction prompts
- [ ] Map styling and markers
- [ ] Boss UI
- [ ] Title/menu art
- [ ] Game-over / victory presentation
- [ ] Accessibility/readability pass

## 12. Final world audit
- [ ] Remove remaining placeholder/procedural visuals where production assets exist
- [ ] Room-by-room composition audit
- [ ] Collision readability audit
- [ ] Navigation landmark audit
- [ ] Environmental storytelling pass
- [ ] Visual repetition audit
- [ ] Performance/art-loading audit
- [ ] Automated tests
- [ ] Browser/play-test verification
- [ ] Update asset documentation and catalog inventory
- [ ] Mark PR ready only when visual definition of done is satisfied
