# Legend of Devs

A full-stack cyberpunk, top-down action adventure about a beginner coder building
skills, publishing projects, and ultimately earning a developer job.

The renderer uses a higher-detail 64×64 tile format, a 1024×640 canvas, and
48×64 directional character sprites with animated movement and attacks.

## Stack

- React, Redux, React Router, and Vite
- Flask, Flask-Login, Flask-WTF, and Flask-SQLAlchemy
- PostgreSQL in production; SQLite for local development
- Flask-Migrate/Alembic migrations

The backend contains only users, authentication, and game saves. The frontend
contains only the landing page, authentication UI, navigation, and game.

## Setup

```bash
pipenv install
pipenv shell
cd react-vite && npm install && cd ..
flask db upgrade
flask seed all
```

Run the backend and frontend in separate terminals:

```bash
flask run
cd react-vite && npm run dev
```

Open <http://localhost:5173>.

Demo account: `demo@aa.io` / `password`

## Controls

- WASD or arrow keys: move
- H: HTML Sword
- J/K: assigned item slots
- L: interact, talk, confirm, and enter
- P: open the Status/Map/Gear pause screens
- Q/E: change pause screen

## Current world

- 72 aligned 16×10-tile Neon Stack City screens across nine regions and eight
  rows, with classic room transitions and staged callback firewalls
- Three 3×3 systems: Browser Sandbox, Component Factory, and Backend Core,
  each with access keys, boss doors, switches, barriers, schematics, caches,
  hidden passages, bosses, and developer-skill rewards
- An HTML Sword, CSS Pulsecaster, JS Callback Drone, animated developer tools,
  shared magic, passive equipment, two assignable item slots, and 20 hearts
- A tabbed Status/Map/Gear pause system and a dedicated Developer Debug Lab
- Local guest saves and account-backed save files
