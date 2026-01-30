# 🏈 Swolecast Archive

The complete searchable archive of the Swolecast podcast — 214 episodes, 2M+ words of fantasy football wisdom.

## Features

- **🔍 Full-Text Search** — Search across all episode transcripts using FTS5
- **📚 Episode Guide** — Browse all 214 episodes with full transcripts and YouTube embeds
- **🎯 Best Of** — Curated quotes and moments (coming soon: AI-curated highlights)

## Tech Stack

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS** — Dark theme, mobile-first
- **SQLite** via better-sqlite3 — Ships the database with the app
- **FTS5** — Fast full-text search across all transcripts

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Data

The SQLite database (`data/swolecast.db`) contains:
- 214 episodes with metadata (title, date, duration, YouTube URL)
- Full transcripts for every episode
- FTS5 full-text search index

## Built for Swolies 🏋️
