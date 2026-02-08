<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI Comic Studio - Nền tảng sáng tạo truyện tranh bằng AI

**Tầm nhìn:** AI Comic Studio là một nền tảng sáng tạo truyện tranh (comic/manga/webtoon) được hỗ trợ bởi AI, cho phép người dùng tạo ra truyện tranh hoàn chỉnh — từ ý tưởng, kịch bản, thiết kế nhân vật, vẽ tranh, lồng tiếng, đến xuất bản — thông qua một hệ thống AI Agent đa vai trò hoạt động như một studio sản xuất ảo.

## ⚠️ Lưu ý quan trọng: Lộ trình phát triển và Ràng buộc

Dự án này là một **lab/learning project** trong giai đoạn đầu, tập trung vào **phát triển ý tưởng và xây dựng MVP cốt lõi**, **không tạo ra sản phẩm thương mại hoặc thu nhập** ở thời điểm hiện tại. Việc triển khai các tính năng tạo doanh thu sẽ được thực hiện khi các điều kiện (đặc biệt là về nguồn vốn và tình trạng visa của founder) cho phép.

Để tối ưu chi phí và tuân thủ các ràng buộc hiện tại, dự án sẽ được phát triển theo hai giai đoạn chính:

### Giai đoạn 1: AI-powered Comic Script Studio (Tập trung vào Kịch bản - MVP)

*   **Mục tiêu:** Xây dựng một sản phẩm cốt lõi mạnh mẽ trong việc hỗ trợ người dùng tạo ra kịch bản truyện tranh chi tiết (cốt truyện, nhân vật, phân cảnh, lời thoại) hoàn toàn bằng văn bản.
*   **Điểm nổi bật:**
    *   Sử dụng AI Text Models (như Google Gemini 2.5 Flash) để phát triển ý tưởng, viết kịch bản, thiết kế nhân vật (mô tả văn bản), kiểm duyệt và kiểm tra tính nhất quán cốt truyện.
    *   Tập trung vào các AI Agent thuộc bộ phận Editorial và Writers' Room.
    *   **Ưu tiên chi phí thấp và không tạo ra thu nhập**, hoàn toàn phù hợp với giai đoạn phát triển ý tưởng và ràng buộc visa H1B.
*   **Giá trị:** Giải quyết pain point lớn cho nhà sáng tạo về ý tưởng và cấu trúc kịch bản, tạo nền tảng vững chắc cho các giai đoạn sau.

### Giai đoạn 2: Tích hợp AI Image/Video/TTS Generation (Mở rộng sau)

*   **Mục tiêu:** Mở rộng sản phẩm để tích hợp AI tạo sinh hình ảnh, video và lồng tiếng, biến kịch bản đã có thành truyện tranh động hoàn chỉnh.
*   **Thời điểm:** Sẽ thực hiện khi dự án đã gọi được vốn, có nguồn lực dồi dào hơn và các ràng buộc pháp lý/visa cho founder đã được giải quyết.
*   **Điểm nổi bật:** Kích hoạt các AI Agent thuộc Art Studio và Post-Production, sử dụng Gemini Image, Video (Veo 3.1) và TTS API.

---

## Giá trị cốt lõi (Value Proposition)

*   **Một người = cả studio:** AI đảm nhận từng vai trò chuyên biệt, giúp một người dùng có thể vận hành cả "studio" sản xuất.
*   **End-to-end pipeline:** Hỗ trợ quy trình 7 bước từ ý tưởng đến xuất bản (dần dần theo các giai đoạn).
*   **Đa ngôn ngữ:** Tích hợp dịch đa ngôn ngữ tự động, UI song ngữ Việt/Anh.
*   **Đa phong cách:** AI kiểm tra tính nhất quán trong phong cách nghệ thuật (sẽ phát triển ở Giai đoạn 2).

## Đối tượng người dùng (Target Users)

*   **Creators/Artists** muốn tăng tốc quy trình sáng tạo.
*   **Writers** muốn chuyển thể kịch bản thành truyện tranh.
*   **Learners** muốn tìm hiểu về quy trình sản xuất comic/manga.
*   **Indie publishers** muốn prototype nhanh.

---

## Kiến trúc hệ thống cấp cao (High-Level Architecture - HLD)

Dự án được thiết kế với kiến trúc hiện đại, phân tán, và hướng dịch vụ, có khả năng mở rộng từ đầu:

### Ứng dụng đa bề mặt (Multi-Surface App)

Gồm 4 bề mặt độc lập, được xây dựng qua Vite:
*   **Landing (`/`):** Trang chủ, điều hướng đến Studio/Reader.
*   **Studio (`/studio/`):** Workspace sáng tạo chính, yêu cầu đăng nhập. (Trọng tâm chính Giai đoạn 1)
*   **Reader (`/reader/`):** Trải nghiệm đọc truyện (mobile-first).
*   **Admin (`/admin/`):** Console quản trị users/projects/stats.

### Tech Stack cốt lõi

*   **Frontend:** React 19, TypeScript, TailwindCSS, Lucide Icons.
*   **Build:** Vite 5 (multi-target builds).
*   **AI Engine:** Google Gemini API (`@google/genai`) — Text, Image, Video (Veo), TTS. (Giai đoạn 1 tập trung vào Text).
*   **AI Providers phụ:** DeepSeek, OpenAI (tùy chọn, cho logic/translation tasks).
*   **Database:** Neon Postgres (`@neondatabase/serverless`) — serverless.
*   **Local Storage:** IndexedDB (offline fallback), localStorage (auth session, settings).

### Dữ liệu và Lưu trữ (Data Flow & Persistence)

*   **Data Flow:** Quy trình 7 bước từ Pitching đến Distribution được điều phối bởi hệ thống AI Agent.
*   **Cloud-First API:** Serverless API (`functions/api/[[route]].ts`) sử dụng Neon Postgres cho user, project và admin endpoints.
*   **Local Fallback:** Nếu backend không khả dụng, dự án được lưu trữ trong IndexedDB, cho phép làm việc offline với giới hạn quota.
*   **Lựa chọn Lưu trữ Dự án (User Preference):**
    *   Người dùng có thể chọn lưu dự án trên **Cloud (Neon Postgres)** để đồng bộ hóa và truy cập đa thiết bị, hoặc **Local (IndexedDB)** trên thiết bị hiện tại để hoàn toàn offline và riêng tư.
    *   Logic này được quản lý bởi `storageService.ts` và tích hợp với backend API.

### Hệ thống AI Agent

13 Agent Roles đại diện cho một studio sản xuất truyện tranh. Trong Giai đoạn 1, chúng ta tập trung vào các agent Text-based:
*   **Editorial:** Project Manager, Market Researcher, Continuity Editor.
*   **Writers' Room:** Scriptwriter, Censor, Translator.
*   (Các agent khác như Character Designer, Panel Artist, Cinematographer, Voice Actor, Publisher, Archivist sẽ được phát triển và kích hoạt ở Giai đoạn 2).

---

## Phát triển cục bộ (Run Locally)

**Điều kiện tiên quyết:** Node.js

1.  Cài đặt các phụ thuộc:
    `npm install`
2.  Thiết lập `API_KEY` của Google Gemini trong `.env.local` của bạn.
3.  Tạo một người dùng trong database (đăng ký bị vô hiệu hóa).
4.  Chạy ứng dụng (ví dụ, Studio):
    `npm run dev:studio`

---
