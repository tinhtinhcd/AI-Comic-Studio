# AI Comic Studio Project Overview

## What this project is
This is a lab/learning project and **not** a production product.

Access is restricted to database-backed accounts; user registration is disabled.
AI Comic Studio is a multi-surface web app for creating and reading AI-generated motion comics. It includes:
- Studio: authenticated creator workspace with multiple AI agent roles.
- Reader: public browsing and reading experience.
- Admin: lightweight admin console for users/projects/stats.
- Landing: simple entry point (root `index.html`).

The app is built with React + Vite and uses a serverless API to persist users and projects when a database is configured. If the backend is unavailable, it falls back to local storage + IndexedDB.

## Entry points and build targets
The Vite config supports multiple targets:
- `TARGET=landing` (default): root `index.html`
- `TARGET=studio`: `src/studio/index.html` + `src/studio/main.tsx`
- `TARGET=reader`: `src/reader/index.html` + `src/reader/main.tsx`
- `TARGET=admin`: `src/admin/index.html` + `src/admin/main.tsx`

Scripts in `package.json` map to those targets:
- `npm run dev` (landing)
- `npm run dev:studio`
- `npm run dev:reader`
- `npm run dev:admin`
- `npm run build` runs all target builds.

## High-level flow
1. Landing (root) is a lightweight entry and can route to Studio/Reader/Admin.
2. Studio requires login. Auth is handled by `authService` via the backend database.
3. Studio agents update a shared `ComicProject` state. The preview panel shows the final comic.
4. Reader loads published projects from storage and displays them in a mobile-first reader UI.
5. Admin pulls users/projects/stats from the backend.

## Core features by surface

### Studio (creator)
Located in `src/studio`.
- `App.tsx`: main shell + layout, auth gate, theme/language persistence.
- Agent workspaces for project manager, script, art, video, etc.
- Preview panel for the assembled comic.

### Reader
Located in `src/reader`.
- Home feed, series details, and immersive reading view.
- Fetches content via `storageService.getActiveProjects()` and enriches with mock metadata for UI.

### Admin
Located in `src/admin`.
- Basic user/project overview and stats dashboard.

## AI and media generation
AI calls are centralized in `src/studio/services/geminiService.ts`:
- Text generation: Gemini by default, with DeepSeek/OpenAI as optional providers based on user preferences.
- Image generation: Gemini image models with optional reference images.
- Video generation: Gemini video generation (`veo-3.1-fast-generate-preview`).
- Voiceover: Gemini TTS.

`prompts.ts` contains the prompt templates and instructions used by the AI services.

## Data storage and persistence

### Cloud-first API
Serverless API: `functions/api/[[route]].ts`
- Uses Neon (Postgres) via `@neondatabase/serverless`.
- Provides auth, project CRUD, and admin endpoints.
- Auto-initializes schema on first access.

### Local fallback
If cloud is unavailable:
- Projects are stored in IndexedDB (`storageService`).
- The UI continues to work offline with a limited quota.

## Key types and state
Shared types live in:
- `src/shared/types.ts`
- `src/studio/types.ts` and `src/reader/types.ts` (surface-specific)

Primary domain objects:
- `ComicProject`, `ComicPanel`, `Character`, `UserProfile`

## Environment variables
Vite injects these at build time:
- `API_KEY` (Gemini)
- `DEEPSEEK_API_KEY`
- `OPENAI_API_KEY`

Studio also supports per-user keys stored in localStorage and user profiles.

## Notable folders
- `src/studio/`: creator experience
- `src/reader/`: reader experience
- `src/admin/`: admin console
- `components/`: legacy/shared UI (used by the root `App.tsx`)
- `functions/api/`: serverless backend
- `services/`: legacy/shared services

## Quick start
1. Install dependencies: `npm install`
2. Add `API_KEY` in `.env.local` or in the Studio settings
3. Run the studio: `npm run dev:studio`
4. Run the reader: `npm run dev:reader`

## Notes and conventions
- The project contains both legacy root components and newer per-surface `src/*` apps.
- Offline-first behavior is intentional; cloud failures should not block use.
- AI providers are selected per task type (creative/logic/translation).
