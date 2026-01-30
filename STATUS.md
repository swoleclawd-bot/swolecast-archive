# Swolecast Archive — Build Status

## ✅ Built & Working

### Tech Stack
- **Next.js 16.1.6** (App Router) + TypeScript + Tailwind CSS
- **SQLite** via better-sqlite3 (read-only, ships the 17MB .db file)
- **FTS5** full-text search across all transcripts
- `npm run build` passes clean — 222 pages statically generated

### Features Implemented

#### 🔍 Search (`/search`)
- Full-text search across all 214 episode transcripts
- Uses existing FTS5 index with Porter stemming
- Results show: episode title, date, duration, matching text snippet with highlighted terms
- Each result links to the episode detail page
- API endpoint at `/api/search?q=query` also available

#### 📚 Episode Guide (`/episodes`)
- All 214 episodes listed, newest first
- Each card shows: title, date, duration, word count
- Episode detail pages (`/episodes/[id]`): full transcript, YouTube embed, metadata
- All 214 episode pages are statically generated at build time

#### 🎯 Best Of (`/best-of`)
- Quote cards with host attribution and tags
- Filter by host (Dave, Davis, Pete, Dan)
- Filter by tag/topic
- Share button on each quote (UI ready, share functionality can be wired up)
- "Coming Soon" banner — ready for AI-curated content later

#### 🏠 Homepage (`/`)
- Search hero with quick suggestion buttons
- Stats bar (214 episodes, 2M+ words, 4 hosts, 100% searchable)
- Recent episodes section
- Featured quotes section

### Design
- Dark theme: zinc/black backgrounds, orange brand accent
- Mobile-first responsive with hamburger menu
- Sticky header with integrated search bar
- Clean card-based UI throughout

### GitHub
- Repo: https://github.com/swoleclawd-bot/swolecast-archive
- Note: pushed to swoleclawd-bot (bot account lacked perms on kitchen-ship-it org)

### Deployment Notes
- `output: 'standalone'` configured in next.config.ts
- Database file at `data/swolecast.db` (17MB) — included in repo
- ⚠️ **Vercel caveat**: better-sqlite3 is a native module. For Vercel deployment, may need to use a serverless-compatible SQLite solution (like `@libsql/client`) or host on a platform that supports native modules. The app builds and runs locally perfectly.

### What's Next
- [ ] Transfer repo to kitchen-ship-it org when bot has perms
- [ ] Deploy to hosting platform
- [ ] Populate Best Of page with AI-curated quotes from transcripts
- [ ] Generate topic tags per episode
- [ ] Add share functionality for quote cards (social image generation)
- [ ] Consider pagination for episode list (currently loads all 214)
