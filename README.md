<div align="center">
  <h1>🎵 SoundLink</h1>
  <p>A Spotify-inspired music platform where you build playlists with YouTube links.</p>
  <p>
    <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/TailwindCSS-3-38bdf8?logo=tailwindcss" alt="TailwindCSS" />
    <img src="https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma" alt="Prisma" />
    <img src="https://img.shields.io/badge/PWA-ready-1DB954" alt="PWA" />
  </p>
</div>

---

## ✨ Features

- **Authentication** — Register, log in, manage your profile
- **Playlists** — Create, edit, and delete public or private playlists
- **YouTube Integration** — Add songs by pasting any YouTube URL; title, duration, thumbnail and channel are extracted automatically
- **Global Player** — Persistent bottom player with play/pause/next/previous/shuffle and volume control
- **Explore** — Browse and search public playlists from all users
- **Offline (PWA)** — Save playlists to IndexedDB and listen without internet; service worker manages page and asset caching

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS |
| State | Zustand |
| Auth | NextAuth v4 (Credentials) |
| ORM | Prisma |
| Database | PostgreSQL |
| Player | YouTube IFrame API |
| Offline | IndexedDB (`idb`) + next-pwa |
| Deploy | Netlify |

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 20
- A PostgreSQL database (e.g. [Supabase](https://supabase.com), [Neon](https://neon.tech), [Railway](https://railway.app))
- A [YouTube Data API v3](https://console.developers.google.com/) key

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/soundlink.git
cd soundlink
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in the values:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/soundlink"
NEXTAUTH_SECRET="<generate with: openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"
YOUTUBE_API_KEY="<your YouTube Data API v3 key>"
```

### 4. Set up the database

```bash
npx prisma db push
# or run migrations in production:
# npx prisma migrate deploy
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🏗 Project Structure

```
soundlink/
├── app/                    # Next.js App Router pages & API routes
│   ├── api/                # API routes (auth, playlists, youtube, profile)
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   ├── explore/            # Public playlist explorer
│   ├── playlist/[id]/      # Playlist detail & player
│   ├── profile/            # User profile
│   └── offline/            # Offline fallback page
├── components/
│   ├── layout/             # Sidebar, Header, MainLayout
│   ├── player/             # PlayerBar, PlayerControls, YouTubePlayer
│   ├── playlist/           # PlaylistCard, PlaylistGrid, SongList, Modals
│   └── ui/                 # Button, Modal, SearchBar
├── hooks/                  # usePlayer, usePlaylist, useOffline, useYouTube
├── lib/                    # prisma.ts, auth.ts, utils.ts
├── services/               # playlistService, youtubeService, offlineService, authService
├── store/                  # Zustand stores (player, playlist, ui)
├── types/                  # Shared TypeScript types
├── prisma/
│   └── schema.prisma       # Database schema (User, Playlist, Song, PlaylistSong)
└── public/
    ├── manifest.json       # PWA manifest
    └── sw-custom.js        # Service worker custom logic
```

---

## ☁️ Deploy to Netlify

### Option A — Netlify UI (recommended)

1. Push the project to GitHub.
2. Go to [netlify.com](https://app.netlify.com) → **Add new site** → **Import from Git**.
3. Select your repository.
4. Netlify auto-detects `netlify.toml` — build command is `npm run build`.
5. Add environment variables in **Site settings → Environment variables**:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` *(set to your Netlify URL, e.g. `https://soundlink.netlify.app`)*
   - `YOUTUBE_API_KEY`
6. Deploy!

### Option B — Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify env:set DATABASE_URL "..."
netlify env:set NEXTAUTH_SECRET "..."
netlify env:set NEXTAUTH_URL "https://YOUR_SITE.netlify.app"
netlify env:set YOUTUBE_API_KEY "..."
netlify deploy --build --prod
```

> **Note:** Netlify uses `@netlify/plugin-nextjs` (listed in `netlify.toml`) to make API routes work as serverless functions.

---

## 🔑 Environment Variables Reference

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random secret used to sign JWTs |
| `NEXTAUTH_URL` | Full URL of the deployment |
| `YOUTUBE_API_KEY` | YouTube Data API v3 key |

---

## 🗺 Roadmap

- [ ] Social features (follow users, share playlists)
- [ ] Migrate backend to NestJS microservice
- [ ] Collaborative playlists
- [ ] More OAuth providers (Google, GitHub)
- [ ] Advanced search (by song / channel)
- [ ] Playback progress bar

---

## 📄 License

MIT © SoundLink contributors
