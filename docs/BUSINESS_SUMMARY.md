# AI Comic Studio — Business Summary & Code Documentation

## 1. Business Overview

### Tầm nhìn (Vision)
**AI Comic Studio** là một nền tảng sáng tạo truyện tranh (comic/manga/webtoon) được hỗ trợ bởi AI, cho phép người dùng tạo ra truyện tranh hoàn chỉnh — từ ý tưởng, kịch bản, thiết kế nhân vật, vẽ tranh, lồng tiếng, đến xuất bản — thông qua một hệ thống **AI Agent đa vai trò** hoạt động như một studio sản xuất ảo.

> ⚠️ Đây là **lab/learning project**, không phải sản phẩm thương mại.

### Giá trị cốt lõi (Value Proposition)
| Vấn đề | Giải pháp |
|--------|-----------|
| Tạo truyện tranh đòi hỏi nhiều kỹ năng (viết, vẽ, dàn trang...) | AI đảm nhận từng vai trò chuyên biệt |
| Chi phí thuê đội ngũ sản xuất cao | Một người dùng có thể vận hành cả "studio" |
| Rào cản ngôn ngữ khi phát hành quốc tế | Tích hợp dịch đa ngôn ngữ tự động |
| Thiếu nhất quán trong phong cách nghệ thuật | AI kiểm tra tính nhất quán (consistency check) |

### Đối tượng người dùng (Target Users)
- **Creators/Artists** muốn tăng tốc quy trình sáng tạo
- **Writers** muốn chuyển thể kịch bản thành truyện tranh
- **Learners** muốn tìm hiểu về quy trình sản xuất comic/manga
- **Indie publishers** muốn prototype nhanh

### Mô hình kinh doanh tiềm năng
- **Freemium**: Gói Standard (Gemini Flash) miễn phí, gói Premium (Gemini Pro) trả phí
- **Per-project**: Giới hạn 3 project slots miễn phí, mở rộng khi trả phí
- **API Key tự cung cấp**: Người dùng có thể dùng API key riêng

---

## 2. Kiến trúc hệ thống (System Architecture)

### 2.1 Multi-Surface App
Ứng dụng gồm **4 bề mặt (surfaces)** độc lập, build riêng qua Vite:

| Surface | Đường dẫn | Mô tả |
|---------|-----------|-------|
| **Landing** | `/` (root `index.html`) | Trang chủ, điều hướng đến Studio/Reader |
| **Studio** | `/studio/` (`src/studio/`) | Workspace sáng tạo chính, yêu cầu đăng nhập |
| **Reader** | `/reader/` (`src/reader/`) | Trải nghiệm đọc truyện (mobile-first) |
| **Admin** | `/admin/` (`src/admin/`) | Console quản trị users/projects/stats |

### 2.2 Tech Stack
| Layer | Công nghệ |
|-------|-----------|
| **Frontend** | React 19, TypeScript, TailwindCSS, Lucide Icons |
| **Build** | Vite 5 (multi-target builds) |
| **AI Engine** | Google Gemini API (`@google/genai`) — Text, Image, Video (Veo), TTS |
| **AI Providers phụ** | DeepSeek, OpenAI (tùy chọn, cho logic/translation tasks) |
| **Database** | Neon Postgres (`@neondatabase/serverless`) — serverless |
| **Local Storage** | IndexedDB (offline fallback), localStorage (auth session, settings) |
| **Media** | FFmpeg (WASM) cho xử lý video client-side |
| **Export** | JSZip cho backup/restore project |

### 2.3 Data Flow
```
User → Login (Auth) → Studio App
  ↓
Project Manager (cấu hình project)
  ↓
Market Researcher (nghiên cứu, lên chiến lược)
  ↓
Scriptwriter (viết kịch bản) → Censor (kiểm duyệt) → Continuity Editor (kiểm tra logic)
  ↓
Character Designer (thiết kế nhân vật) → Consistency Check
  ↓
Panel Artist (vẽ tranh từng panel)
  ↓
Translator (dịch đa ngôn ngữ)
  ↓
Typesetter (dàn trang/in ấn) → Cinematographer (motion comic/video)
  ↓
Voice Actor (lồng tiếng TTS) → Publisher (xuất bản, marketing copy)
  ↓
Archivist (lưu trữ chapters)
```

---

## 3. Hệ thống AI Agent (Core Feature)

### 13 Agent Roles
Mỗi agent đại diện cho một vai trò trong studio sản xuất truyện tranh:

| # | Agent | Vai trò | Department |
|---|-------|---------|------------|
| 1 | **Project Manager** | Tổng Biên Tập — cấu hình project, pipeline | Editorial |
| 2 | **Market Researcher** | Biên Tập Viên Chính — nghiên cứu thị trường, lên chiến lược | Editorial |
| 3 | **Continuity Editor** | BTV Logic — kiểm tra plot holes, tính nhất quán | Editorial |
| 4 | **Scriptwriter** | Biên Kịch — viết kịch bản, thoại, phân cảnh | Writers' Room |
| 5 | **Censor** | Kiểm Duyệt — kiểm tra nội dung (bạo lực, 18+) | Writers' Room |
| 6 | **Translator** | Biên Dịch — dịch đa ngôn ngữ (batch) | Writers' Room |
| 7 | **Character Designer** | Thiết Kế Nhân Vật — tạo hình bằng AI image gen | Art Studio |
| 8 | **Panel Artist** | Họa Sĩ — vẽ tranh từng panel | Art Studio |
| 9 | **Typesetter** | Dàn Trang — layout sách, lettering | Post-Production |
| 10 | **Cinematographer** | Đạo Diễn Chuyển Động — tạo motion comic (Veo video) | Post-Production |
| 11 | **Voice Actor** | Lồng Tiếng — TTS với voice matching | Post-Production |
| 12 | **Publisher** | Nhà Phát Hành — marketing copy, distribution | Post-Production |
| 13 | **Archivist** | Lưu Trữ — archive chapters, quản lý series | Post-Production |

### Workflow Pipeline (7 bước)
```
1. Pitching (Đề cương)     → Market Researcher chat + strategy extraction
2. Scripting (Kịch bản)    → Scriptwriter generates panels + dialogue
3. Model Sheets (Tạo hình) → Character Designer creates character art
4. Art & Panels (Vẽ tranh) → Panel Artist generates panel images
5. Book Layout (Dàn trang)  → Typesetter arranges pages
6. Motion Comic (Dựng phim) → Cinematographer + Voice Actor
7. Distribution (Phát hành) → Publisher generates marketing materials
```

---

## 4. Cấu trúc Code (Code Structure)

### 4.1 Root Level (Legacy + Shared)
```
AI-Commic/
├── App.tsx                    # Root app shell (legacy studio entry)
├── index.html                 # Landing page
├── index.tsx                  # Root React entry
├── types.ts                   # Shared domain types
├── constants.ts               # Agents config, translations (EN/VI), initial state
├── vite.config.ts             # Multi-target Vite config
├── package.json               # Dependencies & build scripts
├── schema.sql                 # Database schema (Neon Postgres)
├── metadata.json              # App metadata
│
├── components/                # UI Components (legacy + shared)
│   ├── AdminApp.tsx           # Admin console
│   ├── AgentWorkspace.tsx     # Main agent workspace (61KB - largest component)
│   ├── AgentTodoList.tsx      # Task management per agent
│   ├── CreativeViews.tsx      # Character Designer + Panel Artist views
│   ├── ProductionViews.tsx    # Typesetter, Cinematographer, Voice, Publisher views
│   ├── ManagerView.tsx        # Project Manager dashboard (45KB)
│   ├── FinalComicView.tsx     # Comic preview sidebar
│   ├── LoginScreen.tsx        # Auth UI
│   ├── ReaderApp.tsx          # Reader experience
│   ├── Sidebar.tsx            # Navigation sidebar
│   ├── UserProfileView.tsx    # User profile management
│   └── Logo.tsx               # Branding
│
├── services/                  # Business logic (legacy)
│   ├── geminiService.ts       # ALL AI calls (text, image, video, TTS)
│   ├── prompts.ts             # Prompt templates for each AI task
│   ├── authService.ts         # Authentication (DB + test mode)
│   └── storageService.ts      # IndexedDB + ZIP backup/restore
│
├── hooks/
│   └── useProjectManagement.ts # Project CRUD hook (save/load/delete slots)
│
├── functions/
│   └── api/                   # Serverless API (Cloudflare/Netlify style)
│       └── [[route]].ts       # Catch-all route handler (auth, projects, admin)
│
├── src/                       # New per-surface apps
│   ├── studio/                # Studio app (23 files)
│   ├── reader/                # Reader app (6 files)
│   ├── admin/                 # Admin app (5 files)
│   ├── shared/                # Shared utilities
│   ├── types.ts               # Extended types
│   └── constants.ts           # Extended constants
│
└── docs/
    ├── PROJECT_OVERVIEW.md    # Technical overview
    └── BUSINESS_SUMMARY.md    # This file
```

### 4.2 Key Domain Types

**`ComicProject`** — Trung tâm của toàn bộ app:
- Chứa toàn bộ state: title, theme, style, characters, panels, pages, logs
- Hỗ trợ multi-chapter (series) với `completedChapters` archive
- Multi-language với `masterLanguage`, `targetLanguages`, `activeLanguage`
- Workflow tracking qua `workflowStage` enum

**`Character`** — Nhân vật:
- Có `referenceImage` (ảnh tham chiếu do user upload)
- `variants` (nhiều phiên bản thiết kế)
- `consistencyStatus` (AI kiểm tra nhất quán)
- `voice` (giọng TTS được gán)

**`ComicPanel`** — Một khung truyện:
- `description` + `dialogue` + `caption`
- `imageUrl` (ảnh AI generate)
- `videoUrl` (motion comic video)
- `audioUrl` (voiceover)
- `translations` (bản dịch đa ngôn ngữ)

### 4.3 AI Service Functions (`geminiService.ts`)

| Function | Mô tả | AI Model |
|----------|--------|----------|
| `sendResearchChatMessage` | Chat với Market Researcher | Gemini Text |
| `extractStrategyFromChat` | Tổng hợp chiến lược từ chat | Gemini Text |
| `analyzeUploadedManuscript` | Phân tích bản thảo upload | Gemini Text |
| `generateStoryConceptsWithSearch` | Tạo concept truyện | Gemini Text |
| `generateComplexCharacters` | Tạo cast nhân vật | Gemini Text |
| `generateSeriesBible` | Tạo "bible" cho series dài | Gemini Text |
| `generateScript` | Viết kịch bản (panels + dialogue) | Gemini Text |
| `generateArtStyleGuide` | Tạo hướng dẫn phong cách vẽ | Gemini Text |
| `generateCharacterDesign` | Thiết kế nhân vật (text → image) | Gemini Image |
| `generatePanelArt` | Vẽ tranh panel (text → image) | Gemini Image |
| `generatePanelVideo` | Tạo motion comic (image → video) | Veo 3.1 |
| `generateVoiceover` | Lồng tiếng TTS | Gemini TTS |
| `batchTranslatePanels` | Dịch hàng loạt panels | Gemini Text |
| `censorContent` | Kiểm duyệt nội dung | Gemini Text |
| `checkContinuity` | Kiểm tra logic/plot holes | Gemini Text |
| `analyzeCharacterConsistency` | Kiểm tra nhất quán hình ảnh | Gemini Text + Vision |
| `verifyCharacterVoice` | Kiểm tra voice phù hợp nhân vật | Gemini Text |
| `generateMarketingCopy` | Tạo nội dung marketing | Gemini Text |

### 4.4 Data Persistence Strategy

```
┌─────────────────────────────────────────┐
│           Cloud (Primary)               │
│  Neon Postgres via Serverless API       │
│  - Users, Projects, Stats              │
│  - Auto-init schema on first access     │
└──────────────┬──────────────────────────┘
               │ fallback if unavailable
┌──────────────▼──────────────────────────┐
│           Local (Fallback)              │
│  IndexedDB: active_projects, library    │
│  localStorage: auth session, settings,  │
│               API keys, theme, language │
│  Quota: 3 project slots per user        │
└─────────────────────────────────────────┘
```

---

## 5. Tính năng nổi bật (Key Features)

### 5.1 Multi-format Support
- **One-Shot**: Truyện ngắn đơn lẻ
- **Series**: Truyện dài kỳ nhiều chương (với chapter archiving)
- **Episodic**: Webtoon cuộn dọc

### 5.2 Publication Types
- **Comic Book / Manga**: Truyện tranh truyền thống
- **Light Novel**: Tiểu thuyết có minh họa

### 5.3 16+ Art Styles
Western, Manga B&W, Manga Color, Anime, 2D Animation, 3D CGI, Webtoon, Wuxia, Noir, Cyberpunk, Realism, Photorealistic, Cultivation, Slice of Life, Gothic Horror, Steampunk, Art Nouveau

### 5.4 Bilingual UI
- Tiếng Việt (mặc định)
- English
- Persistent qua localStorage

### 5.5 Dark/Light Theme
- Toggle theme với persistence

### 5.6 Offline-First
- App hoạt động đầy đủ khi không có backend
- Tự động fallback sang IndexedDB
- Export/Import project qua ZIP

### 5.7 AI Model Tiers
- **Standard**: `gemini-3-flash-preview` (nhanh, rẻ)
- **Premium**: `gemini-3-pro-preview` (chất lượng cao)
- Image: `gemini-2.5-flash-image` hoặc `gemini-3-pro-image-preview`

---

## 6. Quy trình sử dụng (User Journey)

```
1. Đăng nhập → LoginScreen (DB auth hoặc test mode: user@test.com / 123456)
2. Project Lobby → Tạo mới / Mở project cũ / Import ZIP
3. Cấu hình → Chọn format, style, language, AI tier
4. Đề cương → Chat với Market Researcher → Finalize strategy
5. Kịch bản → AI viết script → Censor review → Continuity check
6. Tạo hình → AI thiết kế nhân vật → Consistency check → Lock design
7. Vẽ tranh → AI vẽ từng panel → User review & approve
8. Hậu kỳ → Dàn trang → Motion comic → Lồng tiếng
9. Xuất bản → Marketing copy → Export/Archive
10. Lặp lại cho chapter tiếp theo (series mode)
```

---

## 7. Environment Variables

| Variable | Mô tả |
|----------|--------|
| `API_KEY` | Google Gemini API key (bắt buộc) |
| `DEEPSEEK_API_KEY` | DeepSeek API key (tùy chọn) |
| `OPENAI_API_KEY` | OpenAI API key (tùy chọn) |
| `DATABASE_URL` | Neon Postgres connection string |
| `VITE_USE_TEST_AUTH` | Enable test auth mode |

---

## 8. Hạn chế hiện tại (Known Limitations)

- **Registration disabled**: Chỉ admin tạo user qua DB hoặc dùng test account
- **3 project slots**: Giới hạn lưu trữ local
- **No real-time collaboration**: Single-user per session
- **AI quality varies**: Phụ thuộc vào Gemini model output
- **No payment integration**: Chưa có billing system
- **Legacy code**: Tồn tại song song root components (legacy) và src/ (new)
