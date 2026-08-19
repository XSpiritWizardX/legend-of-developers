# Terrain Interaction System

This document defines the traversal and contextual-interaction model for the next overworld movement pass.

## Design goals

- Preserve the existing responsive small-foot-box movement model.
- Make terrain communicate what the player can do before an action occurs.
- Keep traversal rules deterministic and independently testable.
- Author mechanics through terrain metadata rather than room-specific conditionals.
- Keep all visuals, characters, maps, audio, names, and content original or permissively licensed.

## Terrain vocabulary

| Terrain | Enter from allowed direction | Enter from other direction | Runtime behavior |
| --- | --- | --- | --- |
| `ledgeDown` | yes | blocked | short automatic hop south |
| `ledgeUp` | yes | blocked | short automatic hop north |
| `ledgeLeft` | yes | blocked | short automatic hop west |
| `ledgeRight` | yes | blocked | short automatic hop east |
| `pit` | yes | yes | fall, brief damage, recover to last safe ground |
| `deepWater` | with flippers | blocked | switch to swim movement state |
| `stairs` | yes | yes | preserve walking while changing authored elevation |
| `ramp` | yes | yes | elevation transition without a jump |

Directional ledges are intentionally one-way. The player should not be able to walk back up the cliff face from the low side.

## Traversal states

The runtime should treat traversal as a short state machine rather than teleporting the player:

1. `walk` — normal collision and input.
2. `hop` — input temporarily locked; player follows a short arc across a ledge.
3. `fall` — player shrinks/drops into a pit and loses a small amount of health.
4. `recover` — fade or pop back to the most recent safe ground with invulnerability.
5. `swim` — reduced-speed movement with water-specific animation/effects.

`terrainInteractions.js` contains the pure rules for directionality, landing points, facing probes, and safe-ground recovery. Rendering and timing stay in `engine.js`.

## Contextual interaction

The current game uses generous radial proximity for several interactions. The next pass should probe a point in front of the player and choose the nearest compatible interaction around that probe.

Priority order:

1. carried/lifted object action
2. push/pull/lift object
3. chest or switch
4. NPC/merchant
5. doorway/entrance
6. cut/break terrain
7. generic inspect text

This makes interaction feel spatial: facing the object matters.

## Push, lift, carry, throw

Objects should declare capabilities instead of being hard-coded by sprite name:

```js
{
  kind: "rock",
  pushable: true,
  liftable: true,
  breakable: false,
  requiredStrength: 1,
}
```

Lifted objects attach above the player until thrown or placed. A throw uses the facing direction, checks the landing tile, and can damage enemies or break compatible props.

## Safe-ground history

The engine should remember recent walkable positions while the player is in ordinary `walk` state. A pit fall returns to the latest valid safe point rather than an arbitrary room spawn. The history is intentionally short so recovery remains local and predictable.

## Vertical-slice room

The first playable implementation should be one authored overworld screen near the starting route. It should include:

- a raised terrace with one-way downward ledges
- stairs or a ramp that provides the normal return path
- one pit that demonstrates fall/recovery
- one pushable rock/block
- one liftable/breakable object
- one chest or switch reachable through the new traversal route

Once this room feels correct, the terrain types can be rolled out throughout Everdawn without changing the traversal rules.

## Test strategy

Unit tests should cover:

- one-way ledge direction rules
- landing-point calculation
- pit fall classification
- flipper-gated deep water
- facing-based interaction probes
- last-safe-position recovery

Browser E2E should eventually verify the complete vertical slice: walk to ledge, hop, fall in a pit, recover, manipulate an object, and reach the reward.
