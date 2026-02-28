import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getProvider } from "@/lib/ai/provider";
import { ChapterContentSchema } from "@/lib/schemas";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ seriesId: string; chapterId: string }> }
) {
  try {
    const { chapterId } = await params;
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { series: { include: { conceptSnapshots: { orderBy: { createdAt: "desc" }, take: 1 } } } },
    });
    if (!chapter) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });

    const snapshot = chapter.series.conceptSnapshots[0];
    const outline = await prisma.outline.findFirst({
      where: { seriesId: chapter.seriesId },
      orderBy: { createdAt: "desc" },
    });
    const context = [
      snapshot ? `Concept: ${snapshot.bible} | ${snapshot.characters}` : "",
      outline ? `Outline: ${outline.structure}` : "",
      `Chapter ${chapter.number}: ${chapter.title || "Untitled"}`,
    ].filter(Boolean).join("\n");

    const prompt = `Generate a scene list (heading + brief body) for this chapter. Return JSON with scenes array.\n\n${context}`;
    const provider = getProvider();
    const raw = await provider.generateJSON<unknown>(prompt, "ChapterContent");
    const candidate =
      typeof raw === "object" && raw !== null && "scenes" in (raw as Record<string, unknown>)
        ? raw
        : typeof raw === "object" &&
            raw !== null &&
            "content" in (raw as Record<string, unknown>) &&
            typeof (raw as { content?: unknown }).content === "object" &&
            (raw as { content?: { scenes?: unknown } }).content?.scenes
          ? { scenes: (raw as { content: { scenes: unknown } }).content.scenes }
          : null;

    const parsedResult = ChapterContentSchema.safeParse(candidate);
    const parsed = parsedResult.success
      ? parsedResult.data
      : {
          scenes: [
            {
              id: `ch-${chapter.number}-s1`,
              heading: `Chapter ${chapter.number} - Opening`,
              body: "The chapter opens by establishing the immediate conflict and emotional stakes.",
            },
            {
              id: `ch-${chapter.number}-s2`,
              heading: `Chapter ${chapter.number} - Escalation`,
              body: "The protagonist faces an obstacle that complicates the original goal.",
            },
            {
              id: `ch-${chapter.number}-s3`,
              heading: `Chapter ${chapter.number} - Turn`,
              body: "A reveal or decision shifts the direction and sets up the next chapter.",
            },
          ],
        };

    await prisma.chapterVersion.create({
      data: {
        chapterId,
        content: JSON.stringify(parsed),
        version: 1,
      },
    });
    return NextResponse.json(parsed);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to generate scenes" }, { status: 500 });
  }
}
