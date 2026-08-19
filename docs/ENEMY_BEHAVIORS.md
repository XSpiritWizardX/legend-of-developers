# Enemy Combat Archetypes

The game should not make every enemy feel like the same homing body with different art. Common enemies use distinct, readable movement vocabularies while preserving the existing collision, damage, knockback, and room systems.

- **Forest beetle — charger:** stops briefly to telegraph, commits to a fast straight-line charge, then recovers slowly.
- **Cave bat — swooper:** orbits with a tangential path and periodically cuts inward toward the player.
- **Water blob — lunger:** visibly pauses/squashes, lunges forward, then returns to a slow ooze.
- **Dungeon drone — keep-away:** retreats when crowded, approaches when too far away, and strafes at its preferred range.
- **Major encounters — pressure/circle:** bosses blend pursuit with circling rather than walking directly into the player at a constant speed.

## Readability rules

Fast attacks must be telegraphed before the speed spike. The renderer exposes simple V2-colored rings/glows for windup, squash, lunge, swoop, charge, and boss pressure states. Enemy movement continues to respect existing terrain/collision checks and knockback takes priority over AI movement.

Unknown or future enemy types retain the original direct-chase fallback until they receive an intentional archetype.