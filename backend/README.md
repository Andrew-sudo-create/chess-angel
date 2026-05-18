# Chess Angel Backend

Backend service and sync scripts for pulling Chess.com games and writing frontend-ready JSON.

## What this backend does

- Fetches your games from Chess.com archives
- Enriches each game with `my_color`, `my_result`, `my_rating`, `opponent_rating`
- Writes data files to `../frontend/public/data/`:
  - `games.json`
  - `daily-summary.json`
- Exposes HTTP routes to trigger sync and inspect data

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and set your username:

```bash
CHESS_USERNAME=your_chesscom_username
PORT=4010
SYNC_DAYS=120
FRONTEND_DATA_DIR=../frontend/public/data
```

## Commands

- Full sync (last `SYNC_DAYS`):

```bash
npm run sync
```

- Today-only sync:

```bash
npm run sync:today
```

- Run API server:

```bash
npm run dev
```

## API routes

- `GET /health`
- `GET /api/games?days=30`
- `GET /api/daily-summary`
- `POST /api/sync`

Example sync payload:

```json
{
  "username": "your_chesscom_username",
  "days": 120,
  "todayOnly": false
}
```

## GitHub Action idea (daily auto-commit)

Run `npm run sync:today`, then commit only if `frontend/public/data/*.json` changed.

## Automated daily sync on GitHub

A ready workflow is included at:

- `../.github/workflows/daily-chess-sync.yml`

Setup steps:

1. Push this repo to GitHub.
2. In your GitHub repo, go to:
   - Settings -> Secrets and variables -> Actions -> New repository secret
3. Add:
   - `CHESS_USERNAME` = your Chess.com username
4. In Actions tab, run **Daily Chess Sync** once manually.
5. Keep default schedule or edit the cron in the workflow file.
