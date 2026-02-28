/**
 * LLM Provider - Stub interface.
 * Implement with your preferred provider (OpenAI, Anthropic, Gemini, etc.)
 * Keys should be loaded from env (e.g. LLM_API_KEY) - never hardcode.
 */

import { detectLanguage } from "./extractor";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ProviderConfig {
  apiKey?: string;
  model?: string;
  temperature?: number;
}

export interface Provider {
  chat(messages: ChatMessage[], config?: ProviderConfig): Promise<string>;
  generateJSON<T>(prompt: string, schemaHint?: string, config?: ProviderConfig): Promise<T>;
}

export function getProvider(): Provider {
  const key = process.env.LLM_API_KEY;
  if (!key) {
    return new MockProvider();
  }
  // TODO: return new OpenAIProvider(key) or your implementation
  return new MockProvider();
}

const VI_REPLIES: Record<string, string> = {
  character: "[Mock] Ý tưởng nhân vật tuyệt vời! Hãy phát triển thêm. Điều gì thúc đẩy nhân vật này? Khuyết điểm lớn nhất của họ là gì?",
  world: "[Mock] Thế giới thú vị! Những quy tắc nào chi phối thế giới này? Có phe phái hay nhóm nào cạnh tranh không?",
  conflict: "[Mock] Xung đột hấp dẫn! Nhân vật chính có nguy cơ mất gì? Điều gì khiến phản diện tin rằng họ đúng?",
  theme: "[Mock] Những chủ đề mạnh mẽ. Bạn muốn chúng thể hiện như thế nào trong các nhân vật và cốt truyện?",
  default: "[Mock] Tôi đang khám phá ý tưởng của bạn. Đây là câu chuyện có tiềm năng. Xung đột chính là gì, và ai là nhân vật chính?",
};

const EN_REPLIES: Record<string, string> = {
  character: "[Mock] Great character idea! Let's flesh them out. What drives this character? What's their biggest flaw?",
  world: "[Mock] Interesting world concept! What are the key rules that govern this world? Any competing factions?",
  conflict: "[Mock] That's a compelling conflict! What does the protagonist stand to lose? What makes the antagonist believe they're right?",
  theme: "[Mock] Those are powerful themes. How do you want these to manifest in the character arcs and plot beats?",
  default: "[Mock] I'm exploring your idea. This has potential. What's the central conflict, and who's the protagonist?",
};

const VI_KEYWORDS: Record<string, string[]> = {
  character: ["nhân vật", "protagonist", "hero", "anh hùng", "nữ chính", "nam chính"],
  world: ["thế giới", "bối cảnh", "vương quốc", "phép thuật", "world", "setting", "magic"],
  conflict: ["xung đột", "đối đầu", "stakes", "villain", "phản diện", "chiến tranh"],
  theme: ["chủ đề", "ý nghĩa", "thông điệp", "theme"],
};

class MockProvider implements Provider {
  async chat(messages: ChatMessage[]): Promise<string> {
    const last = messages.filter((m) => m.role === "user").pop();
    if (!last) return "[Mock] How can I help you develop this story?";

    const system = messages.find((m) => m.role === "system");
    const wantVi = system?.content.includes("Vietnamese") || detectLanguage(last.content) === "vi";
    const replies = wantVi ? VI_REPLIES : EN_REPLIES;
    const lower = last.content.toLowerCase();

    for (const [cat, keywords] of Object.entries(VI_KEYWORDS)) {
      if (keywords.some((k) => lower.includes(k))) return replies[cat];
    }
    return replies.default;
  }

  async generateJSON<T>(prompt: string, schemaHint?: string): Promise<T> {
    if (schemaHint === "ConceptSnapshot" || prompt.toLowerCase().includes("extract")) {
      return this.mockMLExtraction(prompt) as T;
    }
    if (prompt.toLowerCase().includes("outline")) {
      return {
        acts: [
          { id: "act1", title: "Act 1: Setup", beats: [
            { id: "b1", title: "Ordinary World", summary: "Introduce protagonist and world.", chapterNumber: 1 },
            { id: "b2", title: "Call to Adventure", summary: "Inciting incident.", chapterNumber: 2 },
          ]},
        ],
        chapterSummaries: [
          { chapterNumber: 1, title: "The Beginning", summary: "We meet our hero." },
        ],
      } as T;
    }
    if (prompt.toLowerCase().includes("scene") || prompt.toLowerCase().includes("chapter")) {
      return {
        scenes: [
          { id: "s1", heading: "Opening", body: "The story begins.", charactersInvolved: ["Protagonist"] },
        ],
        wordCount: 20,
      } as T;
    }
    if (prompt.toLowerCase().includes("critic") || prompt.toLowerCase().includes("qc") || prompt.toLowerCase().includes("quality")) {
      return {
        issues: [{ type: "pacing", location: "Scene 1", description: "Transition could be smoother.", severity: "low" }],
        suggestions: ["Add more sensory detail."],
        score: 78,
      } as T;
    }
    return {} as T;
  }

  private mockMLExtraction(prompt: string): Record<string, unknown> {
    const lower = prompt.toLowerCase();
    const isVi = detectLanguage(prompt) === "vi";
    const lang = isVi ? "vi" : "en";
    const result: Record<string, unknown> = { language: lang };

    const nameMatch = lower.match(/named?\s+["']?(\w+)["']?/) ||
                      lower.match(/tên\s+(?:là\s+)?["']?(\w+)["']?/);

    const genreHints: Record<string, [string, string]> = {
      fantasy: ["fantasy", "fantasy"], "giả tưởng": ["giả tưởng", "fantasy"],
      "sci-fi": ["sci-fi", "sci-fi"], "khoa học viễn tưởng": ["khoa học viễn tưởng", "sci-fi"],
      horror: ["horror", "horror"], "kinh dị": ["kinh dị", "horror"],
      romance: ["romance", "romance"], "lãng mạn": ["lãng mạn", "romance"],
      thriller: ["thriller", "thriller"], "hồi hộp": ["hồi hộp", "thriller"],
    };

    for (const [key, [orig, en]] of Object.entries(genreHints)) {
      if (lower.includes(key)) { result.genre = isVi ? orig : en; break; }
    }

    if (lower.includes("about") || lower.includes("story") || lower.includes("câu chuyện") || lower.includes("premise") || lower.includes("về")) {
      const aboutMatch = prompt.match(/(?:about|về)\s+(.{10,120}?)[\.\n]/i);
      const premiseText = aboutMatch ? aboutMatch[1].trim() : (isVi ? "Một câu chuyện khám phá ranh giới giữa các thế giới." : "A story exploring the boundaries between worlds.");
      result.premise = { original: premiseText, en: isVi ? "A story exploring the boundaries between worlds." : null };
    }

    const characters: Record<string, unknown>[] = [];
    if (nameMatch) {
      const name = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1);
      characters.push({
        name,
        role: { original: isVi ? "nhân vật chính" : "protagonist", en: "protagonist" },
        traits: { original: isVi ? ["quyết tâm", "dũng cảm"] : ["determined", "brave"], en: ["determined", "brave"] },
        goal: { original: isVi ? "Khám phá sự thật" : "Uncover the truth", en: "Uncover the truth" },
      });
    }
    if (lower.includes("villain") || lower.includes("phản diện") || lower.includes("antagonist")) {
      characters.push({
        name: isVi ? "Kẻ Phản Diện" : "The Antagonist",
        role: { original: isVi ? "phản diện" : "villain", en: "villain" },
        traits: { original: isVi ? ["xảo quyệt"] : ["cunning"], en: ["cunning"] },
        goal: { original: isVi ? "Duy trì quyền lực" : "Maintain power", en: "Maintain power" },
      });
    }
    if (characters.length) result.characters = characters;

    const viThemes: Record<string, [string, string]> = {
      "hy sinh": ["hy sinh", "sacrifice"], sacrifice: ["sacrifice", "sacrifice"],
      "chuộc lỗi": ["chuộc lỗi", "redemption"], redemption: ["redemption", "redemption"],
      "tình yêu": ["tình yêu", "love"], love: ["love", "love"],
      "quyền lực": ["quyền lực", "power"], power: ["power", "power"],
      "tự do": ["tự do", "freedom"], freedom: ["freedom", "freedom"],
      "hy vọng": ["hy vọng", "hope"], hope: ["hope", "hope"],
      identity: ["identity", "identity"], "bản sắc": ["bản sắc", "identity"],
    };
    const origThemes: string[] = [];
    const enThemes: string[] = [];
    for (const [key, [orig, en]] of Object.entries(viThemes)) {
      if (lower.includes(key)) { origThemes.push(orig); enThemes.push(en); }
    }
    if (origThemes.length) {
      result.themes = { original: origThemes, en: enThemes };
    }

    if (lower.includes("xung đột") || lower.includes("conflict") || lower.includes("chiến tranh") || lower.includes("war")) {
      result.coreConflict = {
        original: isVi ? "Cuộc đấu tranh cơ bản giữa các thế lực đối lập." : "A fundamental struggle between opposing forces.",
        en: "A fundamental struggle between opposing forces.",
      };
    }

    if (lower.includes("thế giới") || lower.includes("world") || lower.includes("vương quốc") || lower.includes("kingdom")) {
      result.world = {
        setting: {
          original: isVi ? (lower.includes("vương quốc") ? "Một vương quốc thời trung cổ" : "Một thế giới độc đáo") : (lower.includes("kingdom") ? "A medieval kingdom" : "A unique world"),
          en: lower.includes("kingdom") || lower.includes("vương quốc") ? "A medieval kingdom" : "A unique world",
        },
        rules: lower.includes("phép thuật") || lower.includes("magic")
          ? { original: [isVi ? "Phép thuật tồn tại nhưng có giá" : "Magic exists but has a cost"], en: ["Magic exists but has a cost"] }
          : { original: [], en: [] },
      };
    }

    result.openQuestions = {
      original: isVi
        ? ["Nỗi sợ sâu kín nhất của nhân vật chính là gì?", "Câu chuyện kết thúc ra sao?", "Có bước ngoặt nào ở giữa truyện?"]
        : ["What is the protagonist's deepest fear?", "How does the story end?", "What twist could elevate the midpoint?"],
      en: ["What is the protagonist's deepest fear?", "How does the story end?", "What twist could elevate the midpoint?"],
    };

    return result;
  }
}
