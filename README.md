<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI Comic Studio - AI-powered Comic Creation Platform

**Vision:** AI Comic Studio is an AI-powered platform for creating comics/manga/webtoons, enabling users to produce complete comics—from ideation, scripting, character design, illustration, voice acting, to publishing—through a multi-role AI Agent system acting as a virtual production studio.

## ⚠️ Important Note: Development Roadmap and Constraints

This project is a **lab/learning project** in its initial phase, focusing on **idea development and building a core MVP**, **not generating commercial products or income** at this time. The implementation of revenue-generating features will be carried out when conditions (especially regarding funding and the founder's visa status) permit.

To optimize costs and comply with current constraints, the project will be developed in two main phases:

### Tech Stack with Role Mapping

   * Tech/Tool	Role / Purpose.
  * React 19 + TailwindCSS	Frontend surfaces (Studio, Reader, Admin).
  * Vite	Fast, multi-surface build tool.
  * Gemini AI (Text API)	Agent-based script generation, validation, censor.
  * Neon Postgres	Cloud DB for user/projects data.
  * IndexedDB	Offline fallback / privacy-first storage.
  * Node.js	Backend routing and logic handling.


### Phase 1: AI-powered Comic Script Studio (Focus on Text-based Scripting - MVP)

*   **Objective:** Build a robust core product that empowers users to create detailed comic scripts (storyline, characters, panel breakdowns, dialogue) entirely text-based.
*   **Highlights:**
    *   Utilizes AI Text Models (like Google Gemini 2.5 Flash) to develop ideas, write scripts, design characters (textual descriptions), censor, and check storyline consistency.
    *   Focuses on AI Agents from the Editorial and Writers' Room departments.
    *   **Prioritizes low cost and no income generation**, perfectly aligning with the idea development phase and H1B visa constraints.
*   **Value:** Solves a major pain point for creators regarding ideation and script structuring, building a strong foundation for subsequent phases.

### Phase 2: Integrated AI Image/Video/TTS Generation (Expansion Later)

*   **Objective:** Expand the product to integrate AI-generated images, videos, and voiceovers, transforming existing scripts into complete motion comics.
*   **Timing:** Will be implemented when the project has secured funding, has more resources, and the legal/visa constraints for the founder have been resolved.
*   **Highlights:** Activates AI Agents from the Art Studio and Post-Production departments, utilizing Gemini Image, Video (Veo 3.1), and TTS APIs.

---

## Core Value Proposition

*   **One Person = An Entire Studio:** AI takes on specialized roles, enabling a single user to operate an entire "production studio."
*   **End-to-end Pipeline:** Supports a 7-step process from ideation to publishing (gradually across phases).
*   **Multi-language Support:** Integrated automatic multi-language translation, Vietnamese/English bilingual UI.
*   **Multi-art Style:** AI checks for consistency in art style (to be developed in Phase 2).

## Target Users

*   **Creators/Artists** looking to accelerate their creative process.
*   **Writers** wishing to adapt their scripts into comics.
*   **Learners** interested in understanding the comic/manga production process.
*   **Indie publishers** aiming for rapid prototyping.

---

## High-Level Architecture (HLD)

The project is designed with a modern, distributed, and service-oriented architecture, inherently built for scalability:

### Multi-Surface App

Comprising 4 independent surfaces, built via Vite:
*   **Landing (`/`):** Homepage, navigates to Studio/Reader.
*   **Studio (`/studio/`):** Main creator workspace, requires login. (Primary focus of Phase 1)
*   **Reader (`/reader/`):** Comic reading experience (mobile-first).
*   **Admin (`/admin/`):** Console for managing users/projects/stats.

### Core Tech Stack

*   **Frontend:** React 19, TypeScript, TailwindCSS, Lucide Icons.
*   **Build:** Vite 5 (multi-target builds).
*   **AI Engine:** Google Gemini API (`@google/genai`) — Text, Image, Video (Veo), TTS. (Phase 1 focuses on Text).
*   **Supplementary AI Providers:** DeepSeek, OpenAI (optional, for logic/translation tasks).
*   **Database:** Neon Postgres (`@neondatabase/serverless`) — serverless.
*   **Local Storage:** IndexedDB (offline fallback), localStorage (auth session, settings).

### Data Flow & Persistence

*   **Data Flow:** The 7-step process from Pitching to Distribution is orchestrated by the AI Agent system.
*   **Cloud-First API:** Serverless API (`functions/api/[[route]].ts`) uses Neon Postgres for user, project, and admin endpoints.
*   **Local Fallback:** If the backend is unavailable, projects are stored in IndexedDB, allowing offline work with a limited quota.
*   **User Project Storage Preference:**
    *   Users can choose to save their projects on **Cloud (Neon Postgres)** for synchronization and multi-device access, or **Local (IndexedDB)** on the current device for complete offline and privacy.
    *   This logic is managed by `storageService.ts` and integrated with the backend API.

### AI Agent System

13 Agent Roles represent a comic production studio. In Phase 1, we focus on Text-based agents:
*   **Editorial:** Project Manager, Market Researcher, Continuity Editor.
*   **Writers' Room:** Scriptwriter, Censor, Translator.
*   (Other agents like Character Designer, Panel Artist, Cinematographer, Voice Actor, Publisher, Archivist will be developed and activated in Phase 2).

---

## Run Locally

**Prerequisites:** Node.js

1.  Install dependencies:
    `npm install`
2.  Set your Google Gemini `API_KEY` in `.env.local`.
3.  Create a user in the database (registration is disabled).
4.  Run the app (e.g., Studio):
    `npm run dev:studio`

---
