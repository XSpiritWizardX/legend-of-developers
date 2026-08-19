# Third-Party Asset Sources

Legend of Developers may use original assets plus third-party assets whose licenses clearly permit the intended use. This registry exists so the repository can show the provenance and licensing of every imported asset.

## Rules

Before committing an external asset:

1. Verify the license on the creator's original download page.
2. Prefer CC0/public-domain assets when a suitable option exists.
3. Record the creator, source page, license, attribution requirement, and imported file paths here.
4. Keep the upstream asset pack's license/readme alongside vendored assets when practical.
5. Do not copy art, maps, characters, music, sound effects, logos, names, or other creative content from commercial games.
6. Do not assume that "free download" means free for commercial use.
7. If licensing is unclear, do not commit the asset.

## Reviewed candidates

These are candidates reviewed for the terrain-art pass. They are **not yet vendored** into the repository.

| Pack | Creator | Use case | License stated by source | Attribution | Source |
| --- | --- | --- | --- | --- | --- |
| Lucifer - Exterior Tileset | Foozle / commissioned from David | top-down exterior terrain, walls, paths, environment transitions | CC0 1.0 | not required | https://foozlecc.itch.io/lucifer-exterior-tileset |
| Lucifer - Dungeon Tileset | Foozle / commissioned from David | dungeon floors, walls and elevated architectural pieces | CC0 1.0 | not required | https://foozlecc.itch.io/lucifer-dungeon-tileset |
| Lucifer - Desert Tileset | Foozle / commissioned from David | desert terrain and regional variation | CC0 1.0 | not required | https://foozlecc.itch.io/lucifer-desert-tileset |
| Dungeon Tileset 32x32 px | Stealthix | dungeon walls, stairs and props | CC0 1.0 | appreciated, not required | https://stealthix.itch.io/dungeon-tileset-32x32-px |
| Dungeon Assets 32 x 32 px | Stealthix | compatible dungeon props | CC0 1.0 | appreciated, not required | https://stealthix.itch.io/32-x-32-dungeon-assets |
| Free Forest Tilesets | Ulerinn | top-down forest terrain in 16/32/48 px variants | CC0 | appreciated, not required | https://ulerinn.itch.io/free-forest-tilesets |
| Top-down grass, beach and water tileset | Matiaan / OpenGameArt | grass-water-beach transitions | CC0 | not required by CC0 | https://opengameart.org/content/top-down-grass-beach-and-water-tileset |
| 32x32 Water and Land Map Tilesets | Lemmi / OpenGameArt | water, land and snow transitions | CC0 | not required by CC0 | https://opengameart.org/content/32x32-water-and-land-map-tilesets |
| 2D Circle Graphic Desert Cliffs | Jetrel / OpenGameArt | top-down cliff forms and elevation language | CC0 | not required by CC0 | https://opengameart.org/content/2d-circle-graphic-desert-cliffs |

## Current recommendation

Start by prototyping with the existing original/procedural art and the new terrain mechanics. Before the broad visual pass, choose one dominant CC0 family for the overworld and one compatible family for dungeons rather than mixing many unrelated packs. Recoloring and light editing can then bring imported CC0 material into the game's existing palette and scale while preserving a consistent visual identity.

When files are actually imported, add a new **Vendored assets** section below with exact repository paths and the license file committed beside them.

## Vendored assets

None from the reviewed candidate list yet.
