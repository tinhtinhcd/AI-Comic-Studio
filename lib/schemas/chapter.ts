import { z } from "zod";

export const SceneSchema = z.object({
  id: z.string(),
  heading: z.string(),
  body: z.string(),
  charactersInvolved: z.array(z.string()).optional(),
});

export const ChapterContentSchema = z.object({
  scenes: z.array(SceneSchema),
  wordCount: z.number().optional(),
});

export const QCReportSchema = z.object({
  issues: z.array(z.object({
    type: z.string(),
    location: z.string().optional(),
    description: z.string(),
    severity: z.enum(["low", "medium", "high"]).optional(),
  })),
  suggestions: z.array(z.string()).optional(),
  score: z.number().min(0).max(100).optional(),
});

export type Scene = z.infer<typeof SceneSchema>;
export type ChapterContent = z.infer<typeof ChapterContentSchema>;
export type QCReport = z.infer<typeof QCReportSchema>;
