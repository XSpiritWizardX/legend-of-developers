# The Legend of Developer: The Blight of AI

[![CI](https://github.com/XSpiritWizardX/legend-of-developers/actions/workflows/ci.yml/badge.svg)](https://github.com/XSpiritWizardX/legend-of-developers/actions/workflows/ci.yml)

**Live demo:** https://legend-of-developers.onrender.com/

The Legend of Developer is a full-stack, top-down action adventure set in a
fantasy world shaped by software development. Explore a 16×16 overworld,
recover three sigils from themed dungeons, collect developer-inspired gear,
and carry progress between sessions with local or account-backed save files.

The game is rendered on an HTML canvas with 64×64 tiles, room-by-room
transitions, animated sprites, keyboard and touch controls, combat, merchants,
equipment, quests, and a dedicated training hall.

This public repository is maintained as a recruiter-facing engineering sample as
well as a game: changes are tracked with issues, implemented on focused
branches, validated by automated CI, reviewed through pull requests, and
published through semantic-version GitHub Releases.

## Highlights

- 256 authored 16×10 overworld screens spanning eight named regions
- Three 3×3 dungeons: Rootbound Temple, Emberstone Ruins, and Crystalwater
  Vault
- Common enemies, persistent minibosses, three bosses, chests, keys, barriers,
  switches, merchants, and hidden routes
- Sword combat, charged attacks, dashing, magic, equipment upgrades, and two
  assignable item slots
- Status, map, and gear screens plus a Developer Debug Lab/Training Hall
- Three save slots with copy and delete tools
- Browser-local guest saves and authenticated cloud saves with a local fallback
- Reusable PNG/WebP art catalog with built-in canvas-drawn fallbacks

## Tech stack

| Layer | Technology |
| --- | --- |
| Client | React 18, Redux, React Router, Vite, HTML Canvas |
| API | Flask, Flask-Login, Flask-WTF/CSRF, Flask-SQLAlchemy |
| Data | SQLite in development, PostgreSQL in production |
| Schema | Flask-Migrate and Alembic |
| Testing | pytest, pytest-cov, Jest |
| Deployment | Gunicorn and Docker |

The React application owns the game engine, world content, art loading, UI,
and local saves. Flask owns authentication, users, and persisted game saves;
in production it also serves the built frontend.

## Engineering workflow

Pull requests are gated by GitHub Actions that run backend pytest, frontend Jest,
ESLint, the Vite production build, and a production Docker image build. Weekly
Dependabot checks keep Python and npm dependencies visible, while GitHub Actions
dependencies are reviewed monthly. Structured issue forms and the PR checklist
make scope, acceptance criteria, validation, migration impact, documentation,
and release impact explicit.

Tags matching `vMAJOR.MINOR.PATCH` trigger a release workflow that reruns the
core quality gates before GitHub publishes generated release notes. See
[CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md),
[CHANGELOG.md](CHANGELOG.md), [architecture documentation](docs/ARCHITECTURE.md),
and the [release process](docs/RELEASES.md).

The current Dockerfile still performs database migration and demo seeding during
image creation. That deployment concern is intentionally tracked separately in
issue #2 rather than being hidden inside this workflow-focused change.

## Getting started

### Prerequisites

- Python 3.9
- Pipenv, or `pip` and a virtual environment
- Node.js and npm

### Install

From the repository root:

```bash
pipenv install --dev
npm --prefix react-vite install
pipenv run flask db upgrade
pipenv run flask seed all
```

The checked-in `.flaskenv` configures the Flask application, debug mode, and
port `8000`. Development uses `instance/dev.db` unless `DATABASE_URL` is set.
The seed command creates the demo account below along with two additional test
users.

If you prefer an already activated virtual environment, replace the Pipenv
commands with:

```bash
python -m pip install -r requirements.txt
flask db upgrade
flask seed all
```

### Run locally

Start the API and frontend in separate terminals:

```bash
pipenv run flask run
```

```bash
npm --prefix react-vite run dev
```

Open <http://localhost:5173>. Vite proxies `/api` requests to Flask at
<http://127.0.0.1:8000>.

Demo credentials:

```text
Email:    demo@aa.io
Password: password
```

An account is optional. Guests receive the same three file slots, stored in
browser `localStorage`. Signed-in players persist those slots through the API;
the browser copy remains available if the API is temporarily unreachable.

## How to play

| Input | Action |
| --- | --- |
| `WASD` / arrow keys | Move; navigate menus |
| `Shift` | Dash in the facing direction |
| Tap `H` | Sword slash |
| Hold and release `H` | Charged spin attack |
| `J` / `K` | Use item slot A/B; assign highlighted gear in the gear screen |
| `L` / `Enter` / `Space` | Interact, talk, confirm, or buy |
| `P` / `Escape` | Open or close the pause screens |
| `Q` / `E` | Move between Status, Map, and Gear pause tabs |

Touch controls appear on supported narrow/touch layouts. The game page also
provides buttons for the Training Hall and save-file screen.

## Saves and authentication

Each file stores the current map and player position, health, currency, keys,
inventory, equipment, opened chests, defeated persistent encounters, quest
flags, and discovered rooms.

- Guest keys use `legend-of-devs-save-1` through `legend-of-devs-save-3` in
  `localStorage`.
- Authenticated saves are unique per user and slot in the database.
- Writes are mirrored locally and debounced to the Flask API.
- The file screen supports starting, continuing, copying, and deleting saves.

Authentication uses a Flask session cookie and CSRF token. The main endpoints
are:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/auth/` | Restore the current session |
| `POST` | `/api/auth/login` | Log in |
| `POST` | `/api/auth/signup` | Create an account |
| `GET` | `/api/auth/logout` | Log out |
| `GET` | `/api/game/saves` | List the current user's saves |
| `GET` | `/api/game/saves/:slot` | Read one save |
| `PUT` | `/api/game/saves/:slot` | Create or replace one save |
| `DELETE` | `/api/game/saves/:slot` | Delete one save |
| `GET` | `/api/docs` | Inspect registered API routes and docstrings |

Save and user endpoints require authentication.

## Project structure

```text
app/
  api/                 Flask auth, user, and save routes
  forms/               Login and signup validation
  models/              User and GameSave models
  seeds/               Flask seed commands
migrations/            Alembic configuration and revisions
react-vite/
  public/art/          Reusable tiles, props, characters, items, effects, UI
  src/components/Game/ Canvas engine, world model, art loader, and room data
  src/redux/           Session state and CSRF-aware requests
  src/router/          Landing, game, login, and signup routes
tests/                 Flask API tests
docs/                  Test report and supporting documentation
.github/               CI, releases, issue forms, PR template, Dependabot
Dockerfile             Production image and frontend build
Makefile               Combined test and coverage commands
```

The browser routes are `/`, `/game`, `/login`, and `/signup`. For development,
`/game?mode=debug` opens directly in the Training Hall. The playtest query mode
used by room development can target a map and zero-based room coordinate, for
example `/game?mode=playtest&map=overworld&room=1,1`.

## Editing the world and artwork

Every overworld screen has a module at
`react-vite/src/components/Game/rooms/overworld/room-X-Y.js`. The three dungeon
directories contain nine modules each. Room files define floor and wall tile
layers alongside assets, enemies, chests, merchants, entrances, exits, and
triggers.

See the [room editing guide](react-vite/src/components/Game/rooms/README.md) for
the coordinate system, tile codes, collisions, exits, and complete room
examples.

Reusable image assets live under `react-vite/public/art` and are registered in
`react-vite/src/components/Game/art/artCatalog.js`; custom tile codes are
registered in `tileIndex.js`. See the [art guide](react-vite/public/art/README.md)
for supported categories, dimensions, offsets, and catalog examples. Missing
or loading images fall back to the engine's built-in canvas artwork.

## Tests and quality checks

Run all backend and frontend tests from the repository root:

```bash
pipenv run make test
```

Or run each suite independently:

```bash
pipenv run pytest
npm --prefix react-vite test
```

Generate terminal coverage reports for both suites:

```bash
pipenv run make coverage
```

Other frontend checks:

```bash
npm --prefix react-vite run lint
npm --prefix react-vite run build
npm --prefix react-vite run preview
```

The current suite covers authenticated save CRUD and validation, session
reducer behavior, room lookup, authored exits, and world collision boundaries.
One backend test documenting the planned server-side three-slot limit is
intentionally skipped. A saved summary is available in the
[unit test report](docs/unit-test-report.md).

## Database and environment

Common configuration values are:

| Variable | Description | Development default |
| --- | --- | --- |
| `FLASK_APP` | Flask application module | `app` via `.flaskenv` |
| `FLASK_RUN_PORT` | API development port | `8000` via `.flaskenv` |
| `SECRET_KEY` | Flask session signing key | Development-only fallback |
| `DATABASE_URL` | SQLAlchemy connection URL | `sqlite:///dev.db` |
| `FLASK_ENV` | Enables production behavior when set to `production` | Unset |
| `SCHEMA` | PostgreSQL schema used in production | Unset |

Do not commit real secrets or production database URLs. `.env` and local
SQLite databases are ignored by Git.

Useful migration and seed commands:

```bash
pipenv run flask db upgrade
pipenv run flask db migrate -m "describe the change"
pipenv run flask seed all
pipenv run flask seed undo
```

`flask seed undo` deletes seeded users and cascades to their game saves. Treat
it as a destructive development command.

## Production build

Build the frontend directly with:

```bash
npm --prefix react-vite ci
npm --prefix react-vite run build
```

The output is written to `react-vite/dist`, which Flask serves for client-side
routes. The included Dockerfile installs Python and Node dependencies, builds
that bundle, applies migrations, seeds the configured database, and starts
Gunicorn:

```bash
docker build -t legend-of-devs .
docker run --env-file .env -p 8000:8000 legend-of-devs
```

Production requires a PostgreSQL `DATABASE_URL`, a strong `SECRET_KEY`,
`FLASK_ENV=production`, and the intended `SCHEMA`. Review the automatic
migration and seed steps before pointing a build at persistent production data.
