# Emberstone Ruins Gameplay Slice

Emberstone Ruins deliberately teaches a different problem-solving pattern from Rootbound Temple. Instead of walking up to ordered seals, the player must reuse the Wind Disc earned from Temple I to manipulate unreachable furnace regulators.

## Solve loop

1. **Ashen Vestibule** gives a one-time clue: wind reaches the bellows where hands cannot.
2. **Bellows Gallery** contains the western remote furnace regulator.
3. **Exhaust Works** contains the eastern remote regulator. The regulators can be vented in either order by striking them with the Wind Disc.
4. **Pressure Core** remains locked until both outer furnace lines have been vented. Inspecting it names whichever regulator is still missing.
5. Once both lines are cold, `L · VENT` releases the central pressure and permanently opens the Forge Gate.
6. Solving the core exposes an optional **Ash-Worker's Cache** in Exhaust Works. Revisiting the chamber and searching the cooled cache grants 30 gold and a bomb satchel refill.
7. **Sovereign Forge** remains the boss/reward chamber and retains the existing Temple II progression reward.

## Design intent

- immediately validate that Temple I's Wind Disc is a meaningful progression tool
- let the two outer objectives be solved in either order
- avoid arbitrary sequence memorization
- use one-shot environmental hints rather than modal tutorials
- make the central console explain exactly what is missing if the player arrives early
- reward revisiting a solved side room
- preserve save version 3 by storing all puzzle state in the existing `flags` object

## Persistent flags

- `emberstone_clue_seen`
- `emberstone_west_story_seen`
- `emberstone_east_story_seen`
- `emberstone_core_story_seen`
- `emberstone_west_regulator`
- `emberstone_east_regulator`
- `emberstone_core_vented`
- `emberstone_gate_open`
- `emberstone_secret_claimed`
