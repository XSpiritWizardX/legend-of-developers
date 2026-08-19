# Architecture

## System overview

The Legend of Developer is a single-deployment full-stack game. React/Vite owns the browser experience and canvas game engine. Flask owns session authentication, CSRF handling, users, and account-backed save files. SQLAlchemy persists relational data, with SQLite used for local development and PostgreSQL used in production.

```text
Browser
  └─ React / Redux / Canvas game engine
       ├─ authored world + gameplay state
       ├─ local guest save slots
       └─ /api requests
            └─ Flask
                 ├─ auth + CSRF/session boundary
                 ├─ save ownership/API
                 └─ SQLAlchemy
                      └─ SQLite / PostgreSQL
```

## Key boundaries

**Game engine:** `react-vite/src/components/Game/` contains world data, collision/gameplay behavior, rendering, assets, and save integration.

**Client state:** `react-vite/src/redux/` manages authenticated session state and API requests.

**HTTP/API:** `app/api/` contains authentication, user, game-save, and documentation routes.

**Persistence:** `app/models/` and `migrations/` define persisted users and game-save schema evolution.

**Production packaging:** the Docker image installs backend/frontend dependencies, builds the Vite bundle, and starts Gunicorn. Build-time migration/seeding is tracked separately in issue #2 because data mutation should ultimately move out of image creation.

## Quality strategy

Backend API behavior is covered with pytest. Frontend state/world behavior is covered with Jest. ESLint and Vite production builds protect the client build path. GitHub Actions runs the same checks on pull requests and verifies the Docker image.

## Design priorities

1. Save ownership and authentication must never allow cross-user access.
2. Authored world data should remain deterministic and testable.
3. Guest play remains usable even when account-backed persistence is unavailable.
4. Production changes remain reproducible through migrations and documented releases.
