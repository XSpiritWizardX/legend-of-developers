# Adaptive Ambient Music

The game uses a lightweight original Web Audio score rather than bundled third-party music files.

## Goals

- give regions a recognizable mood without overwhelming gameplay SFX
- avoid copyright and asset-license dependencies
- reuse the same browser audio context as gameplay feedback
- adapt automatically to biome, dungeon, living bosses, and Rootbound boss phase
- remain silent until the player has performed a browser-approved input gesture

## Scene families

- Village — warmer, sparse consonant motif
- Forest — wandering minor/dorian figure
- Fields — open neutral exploration motif
- Water — slower suspended movement
- Desert — tighter semitone color and dry pulse
- Mountain — low open intervals
- Cave — sparse low sine ambience
- Rootbound Temple — low ritual pattern
- Emberstone Ruins — tense fire-temple pattern
- Crystalwater Vault — slower water-temple pattern
- Generic Boss — denser, shorter bars
- Cache Colossus — dedicated guardian motif; phase two shortens the bar, adds notes, and slightly raises the music bus while keeping SFX dominant

## Runtime behavior

`gameMusic.js` owns the musical scheduler and only schedules one bar ahead. `engine.js` supplies current map, room title, living guardian, and guardian phase. Changing scenes immediately stops still-scheduled oscillators from the old scene so walking between regions does not create overlapping music.

Music is intentionally low gain. Sword hits, pickups, puzzle feedback, and other gameplay SFX remain the strongest audio cues.

The music scheduler is stopped when the game engine instance is destroyed.
