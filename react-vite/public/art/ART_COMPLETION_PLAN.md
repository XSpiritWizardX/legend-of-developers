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
- [x] Dedicated forest bridge approach/end-cap art integrated in Millpond Crossing
- [x] Path stone detail + firefly atmosphere integrated in Willowbrook
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
- [x] Remaining authored Rootbound rooms production pass
- [x] Broken masonry / floor crack variants integrated
- [x] Root growth variants integrated
- [x] Crystal growth overlays integrated
- [x] Root-carved door / arch transition set integrated in Temple Threshold

## 4. Desert
- [x] Sand autotile family
- [x] Cracked ground autotile family
- [x] Sandstone cliff autotile family
- [x] Dune edge family
- [x] Ruin foreground/arch pieces integrated in Fallen Gate
- [x] Oasis shimmer/transition overlay integrated in Glassspring Oasis
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
- [x] Dock/bridge approach pieces integrated in Breaker Pier
- [x] Waterfall foreground mist layering integrated in Rainfall Shelf
- [ ] Coast room-by-room production pass
- [x] Representative production slice: Gullhook Cove
- [x] Representative production slice: Tideglass Channel
- [x] Representative production slice: Breaker Pier
- [x] Representative production slice: Rainfall Shelf

## 6. Cave and crystal
- [x] Cave floor autotile family
- [x] Cave wall autotile family
- [x] Pit edge/corner family
- [x] Crystal floor autotile family
- [x] Crystal wall autotile family
- [x] Stalactite / ceiling foreground pieces integrated in Crystal Highlands
- [x] Crystal glow overlays integrated in Crystal Highlands
- [ ] Cave/crystal room-by-room production pass
- [x] Representative production slice: Shardmouth Ledge
- [x] Representative production slice: Prism Ascent
- [x] Representative production slice: Echo Gallery
- [x] Representative production slice: Lumen Fault

## 7. Remaining dungeon themes
- [x] Reactor floor/wall 16-state terrain families integrated into Emberstone Ruins
- [x] Reactor structural props / foreground variants integrated into four key rooms
- [x] Server-core floor/wall 16-state terrain families integrated into Crystalwater Vault
- [x] Server-core structural props / foreground variants integrated into four key rooms
- [x] Fire hazard / molten 16-state transition set integrated into Pressure Core
- [x] Water theme coolant/hydraulic 16-state hazard set integrated into Flow Control
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
- [ ] Sword trails and impacts (new sword-arc art authored; renderer hook still pending)
- [x] Live projectile pulse effect upgraded
- [x] Live bomb/explosion effect upgraded
- [x] Live fire / ice effects upgraded
- [x] Live root surge effect upgraded
- [ ] Crystal burst gameplay integration
- [ ] Portal ripple gameplay integration
- [ ] Boss phase aura gameplay integration

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
