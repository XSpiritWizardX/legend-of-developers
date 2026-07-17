# Legend of Devs

A full-stack top-down fantasy adventure inspired by classic 16-bit Zelda games.

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
- J: sword
- K: open nearby chests, enter dungeons, or use the selected item
- Q: change selected item
- M: map
- P: pause

## Current world

- A scrolling 80×60-tile overworld with forests, rivers, mountains, a village,
  bridge crossings, enemies, hidden rewards, and a dungeon entrance
- The Ember Crypt dungeon with rooms, a small key, locked door, dungeon map,
  bombable secret wall, treasure, and a boss
- Sword combat, a returning boomerang, bombs, heart containers, keys, coins,
  local guest saves, and account-backed save files
