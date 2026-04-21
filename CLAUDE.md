# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Frontend (root)
npm install       # Install frontend dependencies
npm run dev       # Start Vite dev server at localhost:3000 (auto-opens browser)
npm run build     # Build for production (output goes to build/)

# Backend (server/)
cd server && npm install   # Install server dependencies
cd server && npm run dev   # Start Express API at localhost:3001 (ts-node-dev, auto-reloads)
```

No test or lint scripts are configured. Run both servers simultaneously for full functionality.

## Architecture

This is a full-stack treasure-hunting game. The frontend is React + TypeScript + Vite + Tailwind CSS v4. The backend is an Express + TypeScript API with a SQLite database.

### Frontend — `src/App.tsx`

All game logic lives in one component. The data model is:

```typescript
interface Box {
  id: number;
  isOpen: boolean;
  hasTreasure: boolean;
}
```

Three `useState` hooks drive the core game:
- `boxes: Box[]` — three chests, one randomly assigned `hasTreasure: true` per game
- `score: number` — +$100 for treasure, -$50 for skeleton
- `gameEnded: boolean` — triggers the end-of-game summary

Key functions: `initializeGame()`, `openBox(boxId)`, `resetGame()`.

When `gameEnded` and the user is signed in, the score is POSTed to `/api/scores` and the history table refreshes.

### Auth — `src/context/AuthContext.tsx`

`AuthProvider` wraps the app and exposes `{ user, loading, login, logout }` via `useAuth()`. On mount it calls `GET /api/auth/me` to restore session state. `src/components/AuthModal.tsx` handles sign-up/sign-in UI.

### Backend — `server/src/`

Express app running on port 3001. The Vite dev server proxies `/api/*` to it.

| File | Purpose |
|---|---|
| `server/src/index.ts` | Express app setup, session middleware, route mounting |
| `server/src/db/index.ts` | better-sqlite3 connection; creates `users` and `scores` tables |
| `server/src/routes/auth.ts` | `POST /api/auth/signup`, `POST /api/auth/signin`, `POST /api/auth/signout`, `GET /api/auth/me` |
| `server/src/routes/scores.ts` | `GET /api/scores` (auth-gated), `POST /api/scores` (auth-gated) |
| `server/src/middleware/auth.ts` | Session-auth guard middleware |

Sessions use `express-session` with a 7-day cookie. Passwords are hashed with bcrypt. The SQLite database file lives at `server/game.db`.

### Assets

| Path | Purpose |
|---|---|
| `src/assets/treasure_closed.png` | Default chest state |
| `src/assets/treasure_opened.png` | Chest with treasure |
| `src/assets/treasure_opened_skeleton.png` | Chest with skeleton |
| `src/assets/key.png` | Key cursor on chest hover |
| `src/audios/chest_open.mp3` | Sound for treasure chest |
| `src/audios/chest_open_with_evil_laugh.mp3` | Sound for skeleton chest |

### UI & animation

- **shadcn/ui** (`src/components/ui/`) — 47+ pre-built components based on Radix UI primitives; use these before writing custom UI.
- **Motion** (Framer Motion) — used for box hover/tap scale, lid flip (`rotateY 180°`), and emoji pop-in animations.
- **`src/components/figma/ImageWithFallback.tsx`** — image component with fallback support.

### Path aliases

`@` resolves to `./src` (configured in `vite.config.ts`). Radix UI packages also have version-compat aliases defined there.

### Build output

Production build writes to `build/` (not the default `dist/`).
