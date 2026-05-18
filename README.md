# Chess Angel

Your personal Chess.com analytics app that auto-syncs games daily and commits fresh data to GitHub.

## What It Does

- Pulls your latest Chess.com games from the public API
- Enriches games with player-perspective fields (`my_color`, `my_result`, ratings, opening info)
- Generates frontend-ready datasets
- Powers a dashboard with streaks, openings, tilt detection, and trend insights
- Auto-commits new daily game data via GitHub Actions

## Project Structure

```text
chess-angel/
├─ frontend/                      # Next.js dashboard UI
│  └─ public/data/
│     ├─ games.json
│     └─ daily-summary.json
├─ backend/                       # Sync + API service
│  ├─ src/cli/sync.ts
│  ├─ src/cli/sync-today.ts
│  └─ src/server.ts
└─ .github/workflows/
   └─ daily-chess-sync.yml        # Daily auto-sync + auto-commit
```

## How It Works

1. `backend` fetches games from Chess.com archives for your username.
2. Data is normalized and written to `frontend/public/data/*.json`.
3. Frontend reads those files directly and renders insights.
4. GitHub Actions runs daily, syncs new games, and commits only if files changed.

This is not local file watching. The daily sync runs on GitHub servers.

## Quick Start (Local)

### 1) Backend setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
CHESS_USERNAME=your_chesscom_username
PORT=4010
SYNC_DAYS=120
FRONTEND_DATA_DIR=../frontend/public/data
```

Sync your games once:

```bash
npm run sync
```

### 2) Frontend setup

```bash
cd ../frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Daily Auto-Commit on GitHub

Workflow file: `.github/workflows/daily-chess-sync.yml`

### One-time setup

1. Push this repo to GitHub.
2. Add repository secret:
   - `CHESS_USERNAME` = your Chess.com username
3. Run **Daily Chess Sync** once manually in the Actions tab.

After that, it will run daily and:

- call `npm run sync:today`
- update `frontend/public/data/games.json` and `daily-summary.json`
- commit and push only when data changed

## Manual Sync Commands

From `backend`:

- `npm run sync` -> full sync (last `SYNC_DAYS`)
- `npm run sync:today` -> today-only sync
- `npm run dev` -> backend API server

## Backend API

- `GET /health`
- `GET /api/games?days=30`
- `GET /api/daily-summary`
- `POST /api/sync`

## Notes

- Some Chess.com fields are inconsistent; opening names are derived from PGN headers/URLs when needed.
- If no new games are found, no commit is created (expected behavior).
- Scheduled workflows can run a few minutes late depending on GitHub Actions load.
