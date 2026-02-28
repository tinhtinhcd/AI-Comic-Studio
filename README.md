# AI Story Studio

A fullstack MVP for developing stories with AI: **ideation** (chat + structured concept memory) and **production** (outline, chapters, scenes, critic). Built with Next.js App Router, TypeScript, Tailwind, and Prisma (SQLite).

---

## Features

- **Ideation mode**
  - Slack-style chat: user messages on the right, assistant on the left.
  - Auto language detection (Vietnamese / English).
  - After each turn, an extractor builds a **Concept Snapshot** (premise, characters, world, themes, conflict, stakes, open questions).
  - Snapshots support **multilingual** fields: `original` (user language) + optional `en` (English) for search/consistency.
  - Right panel: structured memory view with “Show English” toggle and “Save Concept Version”.

- **Production mode**
  - Generate outline → create chapters → **Generate Scenes** → **Draft Chapter** → **Run Critic** → **Approve**.
  - All AI outputs validated with Zod schemas; fallbacks keep the app working when the provider returns unexpected JSON.

- **Language**
  - Series-level: **Language** (Auto / Tiếng Việt / English) and **Output** (Auto / Tiếng Việt / English).
  - Stored per series; assistant and extractor respect these preferences.
  - Messages store an optional `language` field; snapshot stores both original and optional English.

- **LLM**
  - Single provider interface in `lib/ai/provider.ts`; no hardcoded keys.
  - **Mock provider** works without `LLM_API_KEY` (placeholder chat + extraction). Set `LLM_API_KEY` when you plug in a real provider.

---

## Tech Stack

| Layer        | Stack                          |
|-------------|---------------------------------|
| Framework   | Next.js 15 (App Router)        |
| Language    | TypeScript                     |
| Styling     | Tailwind CSS                   |
| Database    | Prisma + SQLite                |
| Validation  | Zod (concept, outline, chapter, QC) |

---

## Project Structure

```
├── app/
│   ├── api/series/
│   │   ├── route.ts                    # GET list, POST create
│   │   └── [seriesId]/
│   │       ├── route.ts                # GET one, PATCH (language prefs)
│   │       ├── ideation/
│   │       │   ├── route.ts            # POST legacy ideation
│   │       │   └── send-json/route.ts  # POST chat + extractor, JSON response
│   │       ├── snapshot/route.ts       # GET/POST snapshot (extract or save)
│   │       ├── outline/route.ts        # GET/POST outline
│   │       ├── chapters/
│   │       │   ├── route.ts            # GET/POST chapters
│   │       │   └── [chapterId]/
│   │       │       ├── scenes/route.ts   # POST generate scene list
│   │       │       ├── draft/route.ts     # POST draft chapter
│   │       │       ├── critic/route.ts    # POST QC report
│   │       │       └── approve/route.ts   # POST approve chapter
│   ├── dashboard/page.tsx              # List/create series
│   ├── studio/[seriesId]/page.tsx      # 3-column Studio (structure, chat/editor, actions + memory)
│   ├── layout.tsx
│   ├── page.tsx                        # Home → Dashboard
│   └── globals.css
├── components/
│   ├── IdeationChat.tsx                # Slack-like chat, send-json
│   ├── SnapshotPanel.tsx               # Renders snapshot sections + “Show English”
│   └── LanguageSelector.tsx            # Lang / Output dropdowns
├── lib/
│   ├── ai/
│   │   ├── provider.ts                 # LLM interface + MockProvider
│   │   ├── extractor.ts                # Prompt, runExtractor, mergeSnapshots, detectLanguage
│   ├── db.ts                           # Prisma singleton
│   └── schemas/
│       ├── concept.ts                  # ConceptSnapshot (multilingual), MLText, helpers
│       ├── outline.ts
│       ├── chapter.ts                  # ChapterContent, QCReport
│       └── index.ts
├── prisma/
│   └── schema.prisma
├── .env.example
└── README.md
```

---

## Setup

1. **Install and env**

   ```bash
   npm install
   cp .env.example .env
   ```

2. **Database**

   - `DATABASE_URL` in `.env`: use `file:./dev.db` so the DB lives under `prisma/dev.db` (relative to schema).

   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). If port 3000 is in use, Next.js will use 3001.

---

## Environment Variables

| Variable        | Required | Description |
|----------------|----------|-------------|
| `DATABASE_URL` | Yes      | SQLite URL, e.g. `file:./dev.db` (resolved relative to `prisma/`). |
| `LLM_API_KEY`  | No       | When set, can be used by a real LLM provider. If unset, MockProvider is used. |

---

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| GET    | `/api/series` | List all series. |
| POST   | `/api/series` | Create series. Body: `{ title?, mode?, primaryLanguage?, preferredOutputLanguage? }`. |
| GET    | `/api/series/[id]` | Get series with messages, snapshot, outlines, chapters. |
| PATCH  | `/api/series/[id]` | Update series. Body: `{ primaryLanguage?, preferredOutputLanguage?, title?, mode? }`. |
| POST   | `/api/series/[id]/ideation` | Legacy: send message, returns `{ reply }`. |
| POST   | `/api/series/[id]/ideation/send-json` | Send message; runs extractor; returns `{ messages, snapshot }` (no redirect). |
| GET    | `/api/series/[id]/snapshot` | Get latest concept snapshot. |
| POST   | `/api/series/[id]/snapshot` | Extract (body: `{ extract: true }`) or save (body: snapshot object). |
| GET    | `/api/series/[id]/outline` | Get latest outline. |
| POST   | `/api/series/[id]/outline` | Generate outline. |
| GET    | `/api/series/[id]/chapters` | List chapters. |
| POST   | `/api/series/[id]/chapters` | Create chapter. Body: `{ outlineId? }`. |
| POST   | `/api/series/[id]/chapters/[chId]/scenes` | Generate scene list for chapter. |
| POST   | `/api/series/[id]/chapters/[chId]/draft` | Draft chapter (from scenes or from scratch). |
| POST   | `/api/series/[id]/chapters/[chId]/critic` | Run quality check; returns report. |
| POST   | `/api/series/[id]/chapters/[chId]/approve` | Set chapter status to approved. |

---

## Data Models (Prisma)

- **Series** – title, mode, primaryLanguage, preferredOutputLanguage.
- **Message** – seriesId, role, content, language.
- **ConceptSnapshot** – seriesId, data (full JSON), legacy bible/characters/world/themes.
- **Outline** – seriesId, structure (JSON).
- **Chapter** – seriesId, outlineId?, number, title?, status (draft | in_review | approved).
- **ChapterVersion** – chapterId, content (JSON scenes), version.
- **QCReport** – chapterId, report (JSON: issues, suggestions, score).
- **ContinuityLog** – chapterId, log (JSON).

Concept snapshot `data` shape (see `lib/schemas/concept.ts`): multilingual fields with `{ original, en? }` for premise, coreConflict, stakes, world.setting, world.rules, character role/traits/goal, themes, openQuestions; plus genre, tone, language.

---

## Scripts

| Script         | Command              | Description |
|----------------|----------------------|-------------|
| Dev            | `npm run dev`        | Start Next.js dev server. |
| Build          | `npm run build`      | Production build. |
| Start          | `npm run start`      | Run production server. |
| Lint           | `npm run lint`       | Next.js lint. |
| DB generate    | `npm run db:generate`| Prisma generate client. |
| DB push        | `npm run db:push`    | Push schema to DB. |
| DB studio      | `npm run db:studio`  | Open Prisma Studio. |

---

## How to Test

1. **Dashboard** – Create a series, open Studio.
2. **Ideation** – Choose Language (e.g. Tiếng Việt) and Output; send messages; confirm snapshot updates and “Show English” in the right panel.
3. **Production** – Generate Outline → Create Chapter → Generate Scenes → Draft Chapter → Run Critic → Approve. Each step should complete without 500s; mock or fallbacks provide valid JSON when needed.

---

## License

Private / unlicensed unless stated otherwise.
