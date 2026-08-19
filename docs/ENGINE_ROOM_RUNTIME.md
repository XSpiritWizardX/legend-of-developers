# Logical-room engine cutover

This phase connects the canvas game loop to the logical room/runtime model introduced by #14 and #16.

## Runtime policy

- Authored logical rooms use their configured camera mode and bounds.
- Legacy fallback rooms retain the existing 16x10 screen-slide transition behavior.
- Room discovery records the logical room ID for authored spaces while preserving legacy discovery keys for unmigrated map screens.
- Room title changes follow logical room boundaries rather than viewport boundaries in converted areas.
- Map changes settle the camera directly to the destination room's camera target before gameplay resumes.

## Compatibility

The player position, tile size, save schema version, combat system, room assets, authored legacy room modules, and world coordinates remain unchanged. This keeps existing saves compatible while allowing the visible presentation of selected areas to evolve independently.

## Validation

The change must pass frontend Jest, ESLint, the Vite production build, backend pytest, and the production Docker image build before merge.
