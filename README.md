# AI Comic Studio – AI-powered Comic Creation Platform

**AI Comic Studio** is an AI-powered platform for building complete comics and webtoons—from idea to script to production—through a multi-agent system simulating a real comic studio. The project aims to empower creators and hobbyists to rapidly ideate, structure, and eventually visualize their work. 

> 🚧 Phase 1 focuses on the **Comic Script Studio**: a powerful tool to create structured comic scripts using Gemini AI. All visual generation will be introduced in Phase 2. This is a personal, non-commercial project under active development and experimentation.

---

## 🎯 Vision

- **One Person = One Studio**: Use AI agents to perform the roles of project manager, scriptwriter, editor, and translator.
- **Full Pipeline**: 7-stage production pipeline from idea → script → panel breakdown → later illustration & publishing.
- **Cost-Efficient**: Text-only MVP with no external image/video generation to minimize cost and comply with current legal constraints.
- **Future-Proof**: Modular architecture designed for future integration of Gemini Image, Veo (video), and TTS APIs.

---

## 🚀 Core Features (Phase 1 – MVP)

| Feature                         | Description                                                                 |
|---------------------------------|-----------------------------------------------------------------------------|
| 📝 Script Creation              | Use Gemini AI to develop storylines, characters, and dialogue.              |
| 🧠 AI Agent System              | Editorial and Writers' Room agents to guide users through creation.         |
| 🔄 Offline/Online Data Handling | Projects can be stored locally (IndexedDB) or synced via Neon Postgres.     |
| 🌐 Bilingual UI                 | English-Vietnamese switchable interface for wider accessibility.            |
| 📦 Modular Architecture         | Vite-powered multi-surface app for studio, reader, and admin tools.         |

---

## 🧱 Technology Stack

| Layer          | Tech Stack                                                                 |
|----------------|-----------------------------------------------------------------------------|
| Frontend       | React 19, TypeScript, TailwindCSS, Lucide Icons                            |
| Build System   | Vite 5 (multi-surface targets: Studio, Reader, Admin, Landing)             |
| AI Engine      | Gemini API (Text only for Phase 1), with future integration of Image/Video |
| Backend API    | Serverless functions (Node.js) with Neon Postgres                          |
| Storage        | Cloud: Neon Serverless Postgres / Local: IndexedDB                         |
| Auth & Session | localStorage, manual account creation (no registration yet)                |

## 🗺️ System Architecture Diagram (Mermaid)

```mermaid
graph TD
    A[User Interface] -->|HTTP| B(Frontend App - React/Vite)
    B --> C1[Studio Editor]
    B --> C2[Reader]
    B --> C3[Admin Console]
    
    B -->|API Calls| D(Serverless API Functions)
    D --> E[Neon Postgres - Cloud DB]
    D --> F[IndexedDB - Local DB]
    
    B -->|Agent Commands| G[AI Agent Layer]
    G --> G1[Scriptwriter Agent]
    G --> G2[Censorship Agent]
    G --> G3[Translator Agent]
    G --> G4[Continuity Editor Agent]
    
    G -->|API Request| H[Gemini API (Text)]
```


## 🧱 System Architecture

AI Comic Studio is designed with a modular and scalable architecture that separates frontend, backend, and AI orchestration concerns.

### 🧩 Key Layers

- **Frontend (4 Surfaces)**: Built with Vite + React 19.
  - `/studio`: Main editor and AI control UI
  - `/reader`: Comic viewer (mobile-first)
  - `/admin`: Management console
  - `/`: Marketing landing page

- **AI Orchestration (Agent Layer)**:
  - Written in TypeScript, acts as controller for AI-based tasks (story writing, translation, censorship).
  - Modular design: each agent handles one responsibility.
  - Future extension: pluggable agent system for image, voice, animation.

- **Backend API (Serverless Functions)**:
  - REST-style routes under `functions/api/*`.
  - Built using Node.js, TypeScript.
  - Data persistence: Neon Postgres (Cloud) or IndexedDB (Offline).

- **Data Layer**:
  - **Cloud (Postgres)**: For user, project, collaboration sync.
  - **Local (IndexedDB)**: Enables offline work, syncs when online.
  - Users choose storage mode dynamically (via `storageService.ts`).

### 🔐 Security and Performance

- Session stored in `localStorage`, scoped to device.
- Project data stored per-device or per-user with fallback sync mechanism.
- Designed with cost efficiency and serverless scale-in-mind.

---

## 📚 7-Step Comic Creation Pipeline

1. **Pitching** – Define theme, tone, and genre.
2. **Character Setup** – Build character bios and motivations.
3. **Storyline** – Use AI to draft story arcs and key events.
4. **Panel Breakdown** – Convert scripts into visual panel instructions.
5. **Dialogue** – Auto-generate multi-language dialogue.
6. **Visual Generation** *(Phase 2)* – Use Gemini Image/Veo API to illustrate panels.
7. **Publishing** *(Phase 2)* – Export to PDF/EPUB or publish to Reader portal.

---

## 🧠 AI Agent System

The system simulates a virtual comic production studio with 13 specialized roles (Phase 1 focuses on text roles only):

| Department     | Agent Role           | Function                            | Status    |
|----------------|----------------------|-------------------------------------|-----------|
| Editorial      | Project Manager      | Oversees flow and enforces constraints | ✅ Phase 1 |
| Editorial      | Market Researcher    | Suggests trends and tone ideas         | ✅ Phase 1 |
| Editorial      | Continuity Editor    | Maintains consistency in plot         | ✅ Phase 1 |
| Writers' Room  | Scriptwriter         | Generates and edits stories           | ✅ Phase 1 |
| Writers' Room  | Censor               | Flags inappropriate content           | ✅ Phase 1 |
| Writers' Room  | Translator           | Adds multi-language dialogue          | ✅ Phase 1 |
| Art Studio     | Character Designer   | Converts bios to image prompts        | 🔜 Phase 2 |
| Art Studio     | Panel Artist         | AI image rendering per panel          | 🔜 Phase 2 |
| Voice/Media    | Voice Actor          | TTS voice for characters              | 🔜 Phase 2 |
| Archive        | Publisher, Archivist | Distribution and export               | 🔜 Phase 2 |

---

## 🖥️ App Surfaces

| Surface  | Path          | Description                                 |
|----------|---------------|---------------------------------------------|
| Landing  | `/`           | Homepage + intro                            |
| Studio   | `/studio/`    | Main comic creation workspace (requires login) |
| Reader   | `/reader/`    | Comic reading experience (mobile-friendly)  |
| Admin    | `/admin/`     | Admin interface (users, stats, moderation)  |

---

## 🗃️ Project Storage Options

- **Cloud Sync (Neon Postgres)** – Projects stored serverlessly, sync across devices.
- **Local Only (IndexedDB)** – Offline-friendly, no network dependency, more privacy.

Users can toggle storage options per project.

---

## 🛠️ How to Run Locally

### Prerequisites:
- Node.js
- Google Gemini API Key

### Setup:
```bash
npm install
cp .env.example .env.local
# Add your Gemini API_KEY in .env.local
npm run dev:studio
```

> Note: Registration is disabled; you must manually insert your user via database for now.

---

## 📁 Folder Structure

```bash
├── /studio/         # Creator UI
├── /reader/         # Comic viewer
├── /admin/          # Admin dashboard
├── /functions/api/  # Serverless API endpoints
├── /agents/         # AI agent definitions
├── /services/       # Storage, auth, AI orchestration
├── /public/         # Assets and screenshots
└── README.md
```

---

## 📌 Legal & Usage Notes

> ⚠️ AI Comic Studio is an experimental personal project under active development. It is not intended for commercial deployment. All AI-generated content is for educational or demo use only. Compliance with Google Gemini API terms is expected.

---

## 📈 Roadmap

- [x] Text-only Studio (Phase 1)
- [x] AI Agent orchestration
- [ ] Public demo with local project save
- [ ] Image + TTS generation (Phase 2)
- [ ] Marketplace for community scripts/assets

---

## 🙋 Contact

For questions or collaboration:

- Email: **tinhtinhcd@gmail.com**
- LinkedIn: [linkedin.com/in/lyvantinh3110](https://www.linkedin.com/in/lyvantinh3110)

---
