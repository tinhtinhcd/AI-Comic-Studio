import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getProvider } from "@/lib/ai/provider";
import { ChapterContentSchema } from "@/lib/schemas";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { seriesId, chapterIndex } = body;
    if (!seriesId || chapterIndex == null) {
      return NextResponse.json({ error: "seriesId and chapterIndex required" }, { status: 400 });
    }
    const chapter = await prisma.chapter.findFirst({
      where: { seriesId, number: Number(chapterIndex) },
      include: { series: { include: { conceptSnapshots: { orderBy: { createdAt: "desc" }, take: 1 } } } },
    });
    if (!chapter) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });

    const snapshot = chapter.series.conceptSnapshots[0];
    const outline = await prisma.outline.findFirst({
      where: { seriesId: chapter.seriesId },
      orderBy: { createdAt: "desc" },
    });
    const context = [
      snapshot ? `Concept: ${snapshot.data || snapshot.bible || ""} | ${snapshot.characters || ""}` : "",
      outline ? `Outline: ${outline.structure}` : "",
      `Chapter ${chapter.number}: ${chapter.title || "Untitled"}`,
    ].filter(Boolean).join("\n");

    const prompt = `Generate a scene list (heading + brief body) for this chapter. Return JSON with scenes array.\n\n${context}`;
    const provider = getProvider();
    const raw = await provider.generateJSON<unknown>(prompt, "ChapterContent");
    const candidate =
      typeof raw === "object" && raw !== null && "scenes" in (raw as Record<string, unknown>)
        ? raw
        : typeof raw === "object" && raw !== null && "content" in (raw as Record<string, unknown>) &&
            typeof (raw as { content?: unknown }).content === "object" &&
            (raw as { content?: { scenes?: unknown } }).content?.scenes
          ? { scenes: (raw as { content: { scenes: unknown } }).content.scenes }
          : null;

    const parsedResult = ChapterContentSchema.safeParse(candidate);
    const parsed = parsedResult.success
      ? parsedResult.data
      : {
          scenes: [
            { id: `ch-${chapter.number}-s1`, heading: `Ch ${chapter.number} - Opening`, body: "Establish conflict and stakes." },
            { id: `ch-${chapter.number}-s2`, heading: `Ch ${chapter.number} - Escalation`, body: "Protagonist faces an obstacle." },
            { id: `ch-${chapter.number}-s3`, heading: `Ch ${chapter.number} - Turn`, body: "Reveal or decision shifts direction." },
          ],
        };

    await prisma.chapterVersion.create({
      data: { chapterId: chapter.id, content: JSON.stringify(parsed), version: 1 },
    });
    return NextResponse.json({ scenes: parsed.scenes, chapterId: chapter.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to generate scenes" }, { status: 500 });
  }
}
