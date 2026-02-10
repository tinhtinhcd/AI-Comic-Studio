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
