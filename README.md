# The Legend of Developer: The Blight of AI

[![CI](https://github.com/XSpiritWizardX/legend-of-developers/actions/workflows/ci.yml/badge.svg)](https://github.com/XSpiritWizardX/legend-of-developers/actions/workflows/ci.yml)

**Live game:** https://legend-of-developers.onrender.com/

The Legend of Developer is a full-stack top-down action-adventure set in Everdawn, a fantasy world shaped by software-development ideas. Players begin in Willowbrook, explore an authored overworld, recover three sigils from themed dungeons, collect developer-inspired equipment, solve environmental puzzles, fight bosses, discover secrets, and continue exploring after restoring the realm.

This repository is both a real playable game and a public engineering portfolio project. Production gameplay, authentication, persistence, responsive controls, artwork, procedural audio, CI, Docker packaging, migrations, and release documentation live together in the same codebase. There is no separate investor-only game environment: the normal player build is the product being demonstrated.

## Highlights

- Authored overworld regions with room discovery, contextual interactions, merchants, secrets, caves, water, desert, mountains, villages, and dungeon entrances
- Three major dungeons: **Rootbound Temple**, **Emberstone Ruins**, and **Crystalwater Vault**
- Persistent multi-step puzzle state, keys, switches, barriers, hidden routes, chests, minibosses, and three original dungeon bosses
- Sword combat, charged attacks, dashing, knockback, projectiles, bombs, elemental rods, grappling, equipment upgrades, swimming, ledges, pits, lifting, carrying, throwing, and contextual world objects
- Status, map, and gear screens with two assignable item slots
- Keyboard and touch controls, including mobile dash and pause-tab navigation
- Three save slots with start, continue, copy, and delete flows
- Browser-local guest saves and authenticated cloud saves with account-scoped local recovery backups
- Real three-sigil completion state followed by post-game exploration
- Original V2 art catalogs for terrain, buildings, props, characters, enemies, bosses, equipment, effects, and UI, with safe canvas fallbacks
- Original adaptive Web Audio score with distinct biome, dungeon, and boss arrangements
- More than 30 synthesized gameplay SFX with separate Music and SFX volume controls

## Tech stack

| Layer | Technology |
| --- | --- |
| Client | React 18, Redux, React Router, Vite, HTML Canvas |
| Game systems | JavaScript canvas engine, authored room/world data, Web Audio |
| API | Flask, Flask-Login, Flask-WTF/CSRF, Flask-SQLAlchemy |
| Data | SQLite in development, PostgreSQL in production |
| Schema | Flask-Migrate and Alembic |
| Testing | pytest, pytest-cov, Jest, ESLint, production build checks |
| Deployment | Docker and Gunicorn |

The React application owns the game engine, world content, art loading, controls, UI, procedural music/SFX, and local save recovery. Flask owns authentication, users, canonical cloud saves, health/readiness reporting, and production frontend serving.

## Player experience

A normal new game begins in Willowbrook. The player earns and upgrades developer-themed gear, explores Everdawn, and restores the three sigils in sequence:

1. **Grove Sigil** — Rootbound Temple
2. **Ember Sigil** — Emberstone Ruins
3. **Crystal Sigil** — Crystalwater Vault

Claiming the Crystal Sigil promotes the save into the canonical **Realm Restored** state. Existing saves that had already earned the third sigil before the completion flag was introduced are migrated automatically. Completed saves remain playable so players can revisit the world and finish optional content.

## Controls

| Input | Action |
| --- | --- |
| `WASD` / arrow keys | Move; navigate menus |
| `Shift` | Dash in the facing direction |
| Tap `H` | Sword slash |
| Hold and release `H` | Charged spin attack |
| `J` / `K` | Use item slot A/B; assign highlighted gear in Gear |
| `L` / `Enter` / `Space` | Interact, talk, confirm, or buy |
| `P` / `Escape` | Open or close pause screens |
| `Q` / `E` | Move between Status, Map, and Gear tabs |

Touch layouts expose movement, Pause, Talk, Dash, Sword, item A/B, and previous/next pause-tab controls.

The Training Hall remains available to developers through `?mode=debug`, but it is intentionally not exposed in the ordinary production player journey. Room-authoring playtests can use `?mode=playtest&map=<map>&room=<x>,<y>`.

## Saves and authentication

An account is optional.

### Guest players

Guest saves live only on the current browser/device. Current keys are account-scoped under the `legend-of-devs-save-guest-*` namespace. Pre-release guest keys are migrated automatically when found.

### Signed-in players

Authenticated saves are stored in PostgreSQL and mirrored to a private browser backup scoped to that user. If the API is unavailable, gameplay can continue against that local recovery copy. When cloud access returns, the game compares cloud/local update times and durable progression, keeps the safer copy, and can promote newer offline progress back to the cloud.

The backend enforces exactly three valid save slots. When the third sigil is present, the server also normalizes the save into the canonical completed-game state.

Main endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Verify web + database readiness |
| `GET` | `/api/auth/` | Restore the current session |
| `POST` | `/api/auth/login` | Log in |
| `POST` | `/api/auth/signup` | Create an account |
| `GET` | `/api/auth/logout` | Log out |
| `GET` | `/api/game/saves` | List the current user's saves |
| `GET` | `/api/game/saves/:slot` | Read one save |
| `PUT` | `/api/game/saves/:slot` | Create or replace one save |
| `DELETE` | `/api/game/saves/:slot` | Delete one save |
| `GET` | `/api/docs` | Inspect registered API routes |

Save and user endpoints require authentication. Guest gameplay does not.

## Art and audio

Reusable game art lives under `react-vite/public/art`. The loader resolves specialized V2 catalogs first and keeps older/canvas artwork only as a compatibility fallback. The current catalogs cover core terrain, biome scenery, village structures and NPCs, enemies, bosses, equipment, combat effects, and interface art.

The soundtrack and sound effects are original Web Audio compositions rather than copied commercial-game music or SFX. Music adapts to biome, dungeon, boss identity, and selected boss phases. Gameplay cues cover combat, damage, enemy/boss defeats, dash/charge, bombs, elemental magic, grappling, doors, switches, secrets, traversal, water, rewards, errors, saving, and UI feedback.

See `react-vite/public/art/README.md` for art registration and `docs/ASSET_SOURCES.md` for asset provenance policy.

## Project structure

```text
app/
  api/                 Flask auth, user, health, and save behavior
  forms/               Login and signup validation
  models/              User and GameSave models
  seeds/               Development seed commands
migrations/            Alembic revisions
react-vite/
  public/art/          Reusable game artwork
  src/components/Game/ Canvas engine, audio, world, rooms, art, and tests
  src/redux/           Session state and CSRF-aware requests
  src/router/          Landing, game, login, and signup routes
tests/                 Flask API/readiness tests
docs/                  Architecture, release, testing, and asset documentation
.github/               CI, releases, issue forms, PR template, Dependabot
Dockerfile             Production image and runtime startup
```

## Local development

### Prerequisites

- Python 3.9 compatible environment
- Node.js and npm
- Pipenv, or `pip` plus a virtual environment

Install dependencies and prepare the development database:

```bash
python -m pip install -r requirements.txt
npm --prefix react-vite install
python -m flask --app app db upgrade
python -m flask --app app seed all
```

The seed command is for local development only. It creates disposable sample users and must not be used as a production provisioning mechanism.

Run Flask and Vite in separate terminals:

```bash
python -m flask --app app run --port 8000
```

```bash
npm --prefix react-vite run dev
```

Open `http://localhost:5173`. Vite proxies `/api` requests to Flask.

## Tests and quality gates

Backend tests:

```bash
pytest -q
```

Frontend tests, lint, and production bundle:

```bash
npm --prefix react-vite test
npm --prefix react-vite run lint
npm --prefix react-vite run build
```

CI runs:

- backend pytest
- a high-severity audit of production npm dependencies
- frontend Jest
- ESLint with zero warnings allowed
- Vite production build
- production Docker image build

Tags matching `vMAJOR.MINOR.PATCH` trigger the release workflow and generated GitHub release notes. See `CONTRIBUTING.md`, `SECURITY.md`, `CHANGELOG.md`, `docs/ARCHITECTURE.md`, and `docs/RELEASES.md` for the broader engineering workflow.

## Production Docker behavior

The Docker image build is deliberately side-effect free. Building an image does **not** connect to, migrate, seed, truncate, or otherwise mutate a database.

At container startup the image:

1. runs `python -m flask --app app db upgrade` against the real runtime database;
2. starts Gunicorn on `0.0.0.0:${PORT:-8000}`.

Production seeding is intentionally omitted. The old shared demo credentials are not part of the normal player experience.

Build and run locally with:

```bash
docker build -t legend-of-devs .
docker run --env-file .env -p 8000:8000 legend-of-devs
```

For production, provide a PostgreSQL `DATABASE_URL`, a strong `SECRET_KEY`, `FLASK_ENV=production`, and the intended `SCHEMA`. Configure hosting health checks against `/api/health` so a deployment is considered ready only when both the web process and save database are available.

## Engineering workflow

Changes are tracked through issues, implemented on focused branches, checked by automated CI, reviewed through pull requests, and published through semantic-version releases. The project intentionally keeps original/licensable creative assets and avoids copying protected art, music, layouts, or audio from commercial games.
