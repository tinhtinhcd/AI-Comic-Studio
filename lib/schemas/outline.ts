import { z } from "zod";

export const BeatSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  chapterNumber: z.number().optional(),
});

export const ActSchema = z.object({
  id: z.string(),
  title: z.string(),
  beats: z.array(BeatSchema),
});

export const OutlineSchema = z.object({
  acts: z.array(ActSchema),
  chapterSummaries: z.array(z.object({
    chapterNumber: z.number(),
    title: z.string(),
    summary: z.string(),
  })).optional(),
});

export type Beat = z.infer<typeof BeatSchema>;
export type Act = z.infer<typeof ActSchema>;
export type Outline = z.infer<typeof OutlineSchema>;
