# Contextual Action Prompts

Action prompts improve discoverability without adding a permanent tutorial overlay.

A small V2-styled prompt appears only when the player is facing a valid action target. Examples include `L · LIFT`, `L · PUSH`, `L · THROW`, `L · OPEN`, `L · ENTER`, `L · TALK`, `L · EXIT`, and `H · CUT`.

The prompt disappears during dialogue, pause/map/inventory screens, and merchant menus. Target detection uses the same facing/reach rules as the underlying interaction system so the UI describes what the player can actually do rather than showing generic proximity hints.