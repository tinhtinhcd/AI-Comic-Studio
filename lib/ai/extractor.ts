import {
  ConceptSnapshotSchema,
  type ConceptSnapshot,
  type MLText,
  type MLStringArray,
  normalizeMLText,
  normalizeMLArray,
} from "@/lib/schemas/concept";
import type { LangCode } from "@/lib/schemas/concept";
import type { Provider } from "./provider";

export interface ExtractorOptions {
  primaryLanguage: LangCode;
  preferredOutputLanguage: LangCode;
}

function langInstructions(opts: ExtractorOptions): string {
  const primary = opts.primaryLanguage === "auto" ? "the language the user is writing in" : opts.primaryLanguage === "vi" ? "Vietnamese" : "English";
  return `
LANGUAGE INSTRUCTIONS:
- The user's primary language is: ${primary}.
- For every text field that uses the {original, en} format:
  - "original" MUST be in the user's primary language (${primary}).
  - "en" should be the English equivalent if the original is not English. If the original IS English, set "en" to null.
- For simple string fields (genre, tone, name): use the user's language for the value.
- Never invent facts; only extract what is supported by the conversation.`;
}

function buildExtractorPrompt(
  conversationLines: { role: string; content: string }[],
  opts: ExtractorOptions
): string {
  const conversation = conversationLines
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");

  return `You are a structured data extractor for a story development tool.
Given the conversation below, extract ALL story concept information into a strict JSON object.

RULES:
- Only include fields you can confidently derive from the conversation.
- Leave fields as null/undefined if the conversation hasn't addressed them.
- Text fields use a multilingual format: { "original": "text in user language", "en": "English version or null" }
- Array fields use: { "original": ["items in user language"], "en": ["English items or null"] }
- Simple string fields (genre, tone, name) are plain strings.
${langInstructions(opts)}

Return ONLY valid JSON matching this schema (no markdown, no explanation):
{
  "language": "vi|en",
  "premise": { "original": "string", "en": "string|null" },
  "genre": "string",
  "tone": "string",
  "themes": { "original": ["string"], "en": ["string"]|null },
  "coreConflict": { "original": "string", "en": "string|null" },
  "stakes": { "original": "string", "en": "string|null" },
  "characters": [{
    "name": "string",
    "role": { "original": "string", "en": "string|null" },
    "traits": { "original": ["string"], "en": ["string"]|null },
    "goal": { "original": "string", "en": "string|null" },
    "arcHint": { "original": "string", "en": "string|null" }
  }],
  "world": {
    "setting": { "original": "string", "en": "string|null" },
    "rules": { "original": ["string"], "en": ["string"]|null },
    "factions": { "original": ["string"], "en": ["string"]|null },
    "conflicts": { "original": ["string"], "en": ["string"]|null }
  },
  "openQuestions": { "original": ["string"], "en": ["string"]|null }
}

CONVERSATION:
${conversation}

JSON:`;
}

export function buildChatSystemPrompt(opts: ExtractorOptions): string {
  let replyLang: string;
  if (opts.preferredOutputLanguage === "vi") {
    replyLang = "Vietnamese";
  } else if (opts.preferredOutputLanguage === "en") {
    replyLang = "English";
  } else {
    replyLang = "the same language the user is writing in";
  }
  return `You are a creative story development assistant. Always reply in ${replyLang}. Help the user brainstorm characters, world, plot, themes, and conflicts for their story.`;
}

export async function runExtractor(
  provider: Provider,
  conversationLines: { role: string; content: string }[],
  opts: ExtractorOptions = { primaryLanguage: "auto", preferredOutputLanguage: "auto" }
): Promise<ConceptSnapshot> {
  const prompt = buildExtractorPrompt(conversationLines, opts);
  const raw = await provider.generateJSON<unknown>(prompt, "ConceptSnapshot");
  return ConceptSnapshotSchema.parse(raw);
}

// --- Merge helpers for multilingual fields ---

function mergeMLText(old: MLText | undefined, inc: MLText | undefined): MLText | undefined {
  if (!inc) return old;
  const o = normalizeMLText(old);
  const n = normalizeMLText(inc);
  if (!n) return old;
  if (!o) return n;
  return {
    original: n.original || o.original,
    en: n.en || o.en,
  };
}

function mergeMLArray(old: MLStringArray | undefined, inc: MLStringArray | undefined): MLStringArray | undefined {
  if (!inc) return old;
  const o = normalizeMLArray(old);
  const n = normalizeMLArray(inc);
  if (!n || !n.original.length) return old;
  if (!o) return n;
  return {
    original: [...new Set([...o.original, ...n.original])],
    en: n.en?.length
      ? [...new Set([...(o.en || []), ...n.en])]
      : o.en,
  };
}

export function mergeSnapshots(
  existing: ConceptSnapshot | null,
  incoming: ConceptSnapshot
): ConceptSnapshot {
  if (!existing) return incoming;

  const merged: ConceptSnapshot = { ...existing };

  merged.language = incoming.language || existing.language;
  merged.premise = mergeMLText(existing.premise, incoming.premise);
  merged.genre = incoming.genre || existing.genre;
  merged.tone = incoming.tone || existing.tone;
  merged.coreConflict = mergeMLText(existing.coreConflict, incoming.coreConflict);
  merged.stakes = mergeMLText(existing.stakes, incoming.stakes);
  merged.themes = mergeMLArray(existing.themes, incoming.themes);
  merged.openQuestions = mergeMLArray(existing.openQuestions, incoming.openQuestions);

  if (incoming.characters?.length) {
    const existingChars = new Map(
      (existing.characters || []).map((c) => [c.name.toLowerCase(), c])
    );
    for (const inc of incoming.characters) {
      const key = inc.name.toLowerCase();
      const old = existingChars.get(key);
      if (old) {
        existingChars.set(key, {
          name: inc.name || old.name,
          role: mergeMLText(old.role, inc.role),
          traits: mergeMLArray(old.traits, inc.traits),
          goal: mergeMLText(old.goal, inc.goal),
          arcHint: mergeMLText(old.arcHint, inc.arcHint),
        });
      } else {
        existingChars.set(key, inc);
      }
    }
    merged.characters = [...existingChars.values()];
  }

  if (incoming.world) {
    const oldW = existing.world || { setting: "" };
    merged.world = {
      setting: mergeMLText(oldW.setting, incoming.world.setting) || oldW.setting,
      rules: mergeMLArray(oldW.rules, incoming.world.rules),
      factions: mergeMLArray(oldW.factions, incoming.world.factions),
      conflicts: mergeMLArray(oldW.conflicts, incoming.world.conflicts),
    };
  }

  if (incoming.lastUpdatedFromMessageId) {
    merged.lastUpdatedFromMessageId = incoming.lastUpdatedFromMessageId;
  }

  return merged;
}

/** Naive language detection: checks for Vietnamese Unicode characters */
export function detectLanguage(text: string): "vi" | "en" | "unknown" {
  const viPattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
  if (viPattern.test(text)) return "vi";
  if (/^[\x00-\x7F\s]+$/.test(text.slice(0, 200))) return "en";
  return "unknown";
}
