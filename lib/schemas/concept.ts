import { z } from "zod";

export const SUPPORTED_LANGUAGES = ["vi", "en", "auto"] as const;
export type LangCode = "vi" | "en" | "auto" | "unknown";

/** Multilingual text field: stores original language + optional English normalized */
export const MLTextSchema = z.union([
  z.object({
    original: z.string(),
    en: z.string().nullable().optional(),
  }),
  z.string(),
]);

/** Multilingual string array: original language list + optional English list */
export const MLStringArraySchema = z.union([
  z.object({
    original: z.array(z.string()),
    en: z.array(z.string()).nullable().optional(),
  }),
  z.array(z.string()),
]);

export const CharacterSchema = z.object({
  name: z.string(),
  role: MLTextSchema.optional(),
  traits: MLStringArraySchema.optional(),
  goal: MLTextSchema.optional(),
  arcHint: MLTextSchema.optional(),
});

export const WorldSchema = z.object({
  setting: MLTextSchema,
  rules: MLStringArraySchema.optional(),
  factions: MLStringArraySchema.optional(),
  conflicts: MLStringArraySchema.optional(),
});

export const ConceptSnapshotSchema = z.object({
  language: z.string().optional(),
  premise: MLTextSchema.optional(),
  genre: z.string().optional(),
  tone: z.string().optional(),
  themes: MLStringArraySchema.optional(),
  coreConflict: MLTextSchema.optional(),
  stakes: MLTextSchema.optional(),
  characters: z.array(CharacterSchema).optional(),
  world: WorldSchema.optional(),
  openQuestions: MLStringArraySchema.optional(),
  lastUpdatedFromMessageId: z.string().optional(),
});

export type MLText = z.infer<typeof MLTextSchema>;
export type MLStringArray = z.infer<typeof MLStringArraySchema>;
export type Character = z.infer<typeof CharacterSchema>;
export type World = z.infer<typeof WorldSchema>;
export type ConceptSnapshot = z.infer<typeof ConceptSnapshotSchema>;

// --- Helpers to read/write multilingual values uniformly ---

/** Get display text from an MLText field, preferring given language */
export function mlText(val: MLText | undefined | null, preferEn = false): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (preferEn && val.en) return val.en;
  return val.original;
}

/** Get display array from an MLStringArray field */
export function mlArray(val: MLStringArray | undefined | null, preferEn = false): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (preferEn && val.en) return val.en;
  return val.original;
}

/** Wrap a plain string into the MLText object format */
export function toMLText(original: string, en?: string | null): { original: string; en: string | null } {
  return { original, en: en ?? null };
}

/** Wrap a plain string array into the MLStringArray object format */
export function toMLArray(original: string[], en?: string[] | null): { original: string[]; en: string[] | null } {
  return { original, en: en ?? null };
}

/** Normalize a field that might be a plain string (legacy) into MLText */
export function normalizeMLText(val: MLText | undefined | null): { original: string; en: string | null } | null {
  if (!val) return null;
  if (typeof val === "string") return { original: val, en: null };
  return { original: val.original, en: val.en ?? null };
}

/** Normalize a field that might be a plain array (legacy) into MLStringArray */
export function normalizeMLArray(val: MLStringArray | undefined | null): { original: string[]; en: string[] | null } | null {
  if (!val) return null;
  if (Array.isArray(val)) return { original: val, en: null };
  return { original: val.original, en: val.en ?? null };
}
