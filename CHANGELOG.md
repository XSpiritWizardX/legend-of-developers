# Changelog

Notable product and engineering changes are recorded here. Releases use semantic version tags and GitHub generated release notes.

## Unreleased

### Gameplay and presentation
- Expand the original synthesized gameplay SFX bank to more than 30 cues and wire release-critical feedback into combat, traversal, bombs, elemental items, grappling, doors, switches, secrets, player damage, enemy defeats, and boss phases.
- Deepen the adaptive original Web Audio score with layered arrangements and distinct boss identities for Cache Colossus, Flux Sovereign, and Root Warden.
- Add independent persistent Music and SFX controls.
- Add consistent sprite grounding/shadow treatment across character and enemy artwork.
- Add a real three-sigil completion state, completion presentation, and post-game exploration flow.
- Preserve older Crystal-Sigil saves by promoting them into the canonical completed-game state.
- Add full touch-control parity for dash and Status/Map/Gear tab navigation.
- Keep Training Hall/developer tooling out of the ordinary production player path while preserving explicit development URLs.

### Saves and reliability
- Separate guest and authenticated local save namespaces.
- Keep account-scoped local recovery copies of cloud saves.
- Recover newer offline progress back to cloud after an API outage while preferring newer cloud progress from another device when appropriate.
- Enforce the three-slot save contract in the Flask API.
- Normalize completed three-sigil saves on the server as well as the client.
- Add `/api/health` readiness reporting for both the web process and save database.

### Security and deployment
- Update `js-cookie` to 3.0.8, incorporating the cookie-attribute-injection security fix while retaining compatibility fixes.
- Add a high-severity production npm dependency audit to CI.
- Make Docker image creation side-effect free: production database migrations no longer run at image build time and shared demo users are never seeded in production builds.
- Apply Alembic migrations at container startup and bind Gunicorn explicitly to `0.0.0.0:${PORT}` for hosted environments such as Render.

### Product UI
- Align the landing page, navigation, login, and signup experiences with the current Everdawn / Willowbrook / three-sigil game identity.
- Clarify guest play versus authenticated cloud saves and remove the shared Demo Login from the normal player journey.
- Add production page metadata for description, theme, OpenGraph, and social sharing.

### Engineering
- Add GitHub Actions quality gates for backend tests, frontend tests/lint/build, production dependency auditing, and Docker image verification.
- Add tag-driven GitHub Release automation.
- Add structured issue forms, pull-request checklist, dependency update automation, contribution guidance, security policy, and architecture/release documentation.
- Add regression coverage for the expanded audio bank, save completion normalization, and production health endpoint.

### Documentation
- Rewrite the README around the real player build, production persistence model, original art/audio architecture, current controls, deployment behavior, and release-quality gates.
- Maintain a recruiter-visible issue → branch → CI → PR → release workflow.

## Release policy

- **Patch** (`vX.Y.Z`): bug fixes, security fixes, small compatibility changes.
- **Minor** (`vX.Y.0`): backward-compatible gameplay or platform features.
- **Major** (`vX.0.0`): intentionally breaking save/API/platform changes.

See `docs/RELEASES.md` for the release checklist.
