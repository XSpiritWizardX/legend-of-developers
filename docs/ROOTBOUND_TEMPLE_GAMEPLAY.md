# Rootbound Temple Gameplay Vertical Slice

Rootbound Temple is the first dungeon being treated as an authored player-retention slice rather than a collection of connected combat rooms.

## Intended solve loop

1. **Temple Threshold** quietly introduces the rule through a one-time inscription: the Keeper wakes the western root, and the east answers.
2. **Keeper's Key** contains the first root seal. Facing it exposes `L · ATTUNE`.
3. **Cartographer's Tomb** contains the second seal. It refuses to activate before the Keeper seal, reinforcing the clue instead of silently accepting an arbitrary order.
4. Activating both seals permanently opens the **Heart Gate** in Four-Root Hall through save flags.
5. Once the gate is open, revisiting the Keeper statue exposes `L · SEARCH` and grants the optional **Keeper's Heart** reward: one permanent heart container plus 25 gold.
6. **Heartroot Sanctum** introduces the Cache Colossus. Above half health it uses a slower targeted fan. At half health it enters phase two, speeds up, and adds a telegraphed radial root volley plus a faster aimed shard.
7. Defeating the guardian leaves the existing Grove Sigil reward flow intact.

## Design rules

- Clues are short, one-shot, and never freeze player control.
- Puzzle progress is stored in the existing save `flags` object; save version stays at 3.
- The central gate is a virtual collision volume tied to the same persistent flags as its visible barrier.
- Secret content rewards observation and revisiting a solved room instead of putting every reward directly on the critical path.
- Boss projectiles always telegraph before becoming dangerous.
- No proprietary layouts, characters, art, names, or audio from existing commercial games are used.

## Rootbound save flags

- `rootbound_clue_seen`
- `rootbound_west_story_seen`
- `rootbound_east_story_seen`
- `rootbound_sanctum_story_seen`
- `rootbound_west_seal`
- `rootbound_east_seal`
- `rootbound_gate_open`
- `rootbound_secret_claimed`

## Validation

The pure content model tests:

- seal order and persistent gate progression
- early east-seal refusal
- contextual puzzle prompts
- one-time secret reward
- gate collision state
- one-shot environmental story beats
- deterministic boss phase threshold and pacing changes

The enemy attack model separately tests fan/radial projectile patterns, telegraph delay, movement, collision, and expiry.
