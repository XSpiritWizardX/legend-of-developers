# Legend of Developers — Current Release Art Completion

This document records the visual definition of done for the **currently playable/authored release**. Future dungeon themes or rooms that do not yet exist are tracked separately and do not block this art release.

## Release art — complete

### Rendering and tiles
- [x] 64x64 reusable tile convention
- [x] Catalog-driven art loading with packed source rectangles
- [x] N/E/S/W 16-state neighbor-aware autotiling
- [x] Collision/gameplay meaning separated from visual selection
- [x] Foreground/depth vocabulary for canopies, cliff lips, arches, roots, cave ceilings, mist and glows
- [x] Animated water art already supported by the catalog
- [x] Forest ground/path/cliff families
- [x] Rootbound floor/wall families
- [x] Desert sand/cracked/cliff/dune families
- [x] Coast shore/open-water/shallow-water families
- [x] Cave floor/wall/pit families
- [x] Crystal floor/wall families
- [x] Emberstone reactor floor/wall/molten families
- [x] Crystalwater server-core floor/wall/coolant families

### Authored room art
- [x] Willowbrook Village
- [x] Eastwind Meadow
- [x] Applewood Orchard
- [x] Millpond Crossing
- [x] Rootbound Temple — all authored d01 rooms
- [x] Amber Wastes — Fallen Gate + Glassspring Oasis showcase slice
- [x] Sunscar Desert — Broken Colonnade + Caravan Scar showcase slice
- [x] Stormbreak Coast — Gullhook Cove, Tideglass Channel, Breaker Pier, Rainfall Shelf
- [x] Crystal Highlands — Shardmouth Ledge, Prism Ascent, Echo Gallery, Lumen Fault
- [x] Emberstone Ruins — reactor identity integrated into key authored rooms
- [x] Crystalwater Vault — hydraulic/server identity integrated into key authored rooms

### Environment polish
- [x] Forest canopy, bridge approaches, path detail and firefly ambience
- [x] Rootbound arches, hanging roots, floor cracks, root invasion, crystal growth and root-carved doorway
- [x] Desert ruin arches and oasis shimmer
- [x] Coast foam, bridge approaches and waterfall mist
- [x] Cave ceiling silhouettes and crystal light/glow
- [x] Reactor machinery, heat vents, conduits, lava grates and gantries
- [x] Server pumps, coolant pipes, columns, turbine grates and aqueducts

### Characters and enemies
- [x] Player four-direction/four-frame walk sheet audit
- [x] Dedicated player attack sheet audit
- [x] Gardener/mechanic villager consistency audit
- [x] Traveler and technician merchant polish
- [x] Archivist and network-scout quest-character polish
- [x] Forest enemy silhouette + two-frame idle animation
- [x] Cave enemy silhouette + two-frame idle animation
- [x] Desert enemy silhouette + two-frame idle animation
- [x] Water enemy silhouette + two-frame idle animation
- [x] Dungeon enemy silhouette + two-frame idle animation
- [x] Null Knight miniboss silhouette polish
- [x] Cache Colossus, Flux Sovereign and Root Warden silhouette polish
- [x] Cache Colossus + Root Warden live idle-energy animation
- [x] Live enemy hit blink, knockback, particles and hit-stop presentation
- [x] Live boss HP presentation and Cache Colossus phase-change ring/particles

### Items, combat art and VFX
- [x] Complete current equipment/item icon catalog audit
- [x] HTML Sword reward pickup uses production item art
- [x] Live projectile effect upgraded
- [x] Live bomb/explosion effect upgraded
- [x] Live fire effect upgraded
- [x] Live ice effect upgraded
- [x] Live root-surge effect upgraded
- [x] Sword-arc, crystal-burst, portal-ripple and boss-aura art authored for future/expanded hooks

### UI and presentation
- [x] HUD hearts and magic-meter consistency pass
- [x] Inventory item-slot presentation
- [x] Shared dialogue/menu/map panel frame polish
- [x] Player/cache/shop map-marker polish
- [x] Selection cursor polish
- [x] Title crest authored and integrated on save-select and chapter-start overlays
- [x] Save-file/title presentation remains responsive on mobile

### Verification
- [x] Autotile regression coverage for registered terrain families
- [x] Animated enemy catalog regression coverage
- [x] Previous full CI pass verified Docker build, backend pytest, frontend Jest, lint and production build during this branch
- [x] PR remains mergeable against the unchanged `main` base
- [ ] Latest-head CI must finish green before merge

## Post-release visual polish backlog — non-blocking

These are enhancements for future content or deeper engine work, not missing art for the current authored release:

- First-class explicit background/world/foreground layer field in the renderer
- Deterministic decorative variant selection across every terrain family
- More full-world room-by-room compositions beyond the current showcase/release slices
- Additional shadow/void, ice, desert-dungeon, light, storm, sky and royal tilesets **when those authored dungeons are added**
- Dedicated sword-arc/crystal-burst/portal-ripple/boss-aura renderer hooks beyond the already-live combat effects
- Dedicated cinematic victory/game-over illustration sequence
- Additional enemy directional/attack animation beyond current idle + live AI-state telegraphs

## Release gate

The current-release art pass is considered complete when the newest CI run is green. Keep PR #42 draft until that run finishes; then it can move to ready-for-review/merge.
