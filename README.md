# YouTube Analytics Dashboard

A channel performance dashboard: a Python (FastAPI + pandas) backend that pulls data
from the YouTube Data API v3, and a React + TypeScript (TSX) frontend with a dark,
RTL Hebrew interface.

Works out of the box with **demo data** — no API key needed to start.

## What it shows

- Channel header: subscribers, total views, video count
- KPIs: average / median views, engagement rate, uploads per week
- Views by upload month (total + average per video)
- Best weekday to upload (Israeli week, Sunday first)
- Shorts vs. long videos comparison
- Top 5 videos and a sortable, filterable table of all analyzed videos

## Quick start

### 1. Backend (Python 3.10+)

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate   |   macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # Windows: copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### 2. Frontend (Node 18+)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Deploy to Cloudflare Pages

The Python backend can't run on Pages, so `frontend/functions/` contains a TypeScript
port of the API (same `/api/health` and `/api/analytics` routes, same JSON shape).
The Python backend stays in `backend/` for local use.

In Cloudflare: Workers & Pages → Create → Pages → Connect to Git, then set:

| Setting | Value |
| ------- | ----- |
| Root directory | `frontend` |
| Build command | `npm run build` |
| Build output directory | `dist` |

Then add `YOUTUBE_API_KEY` under Settings → Variables and Secrets (optional;
without it the site shows demo data). `TIMEZONE` and `MAX_VIDEOS` are set in `wrangler.toml`.

Local test: `cd frontend && npm run dev:pages`. Direct deploy: `npm run deploy`.

## Getting a YouTube API key (for real channels)

1. Go to https://console.cloud.google.com and create a project
2. APIs & Services → Library → enable **YouTube Data API v3**
3. APIs & Services → Credentials → Create credentials → API key
4. Put it in `backend/.env`: `YOUTUBE_API_KEY=your_key_here`
5. Restart the backend

Then search by `@handle`, a channel URL, or a channel ID (`UC...`).
Each search costs only a few quota units (daily free quota is 10,000), and
results are cached for 10 minutes.

## API

| Method | Path | Params |
| ------ | ---- | ------ |
| GET | `/api/health` | — |
| GET | `/api/analytics` | `channel`, `demo` (bool), `limit` (5–200) |

## Ideas for next steps (good Python practice)

- Save daily snapshots to SQLite and chart subscriber growth over time
- Compare two channels side by side
- Find which title words correlate with more views (pandas `str.contains` + `groupby`)
- Export the video table to CSV
