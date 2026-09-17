# Spinning Saw

The `spinning-saw` enemy uses the committed `public/art/enemies/spinning-saw.png.png` pixel art.

It is rendered at 64×64, rotates continuously at about 1.6 revolutions per second, uses the standard non-boss enemy collision/damage/defeat rules, and is installed as a deterministic recurring overworld encounter. Opening grove/town rooms are excluded, and installation is idempotent so remounting the game does not duplicate saw definitions.
