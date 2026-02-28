import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getProvider } from "@/lib/ai/provider";
import { ChapterContentSchema } from "@/lib/schemas";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ seriesId: string; chapterId: string }> }
) {
  try {
    const { chapterId } = await params;
    const body = await req.json();
    const { scenes } = body;

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { versions: { orderBy: { version: "desc" }, take: 1 } },
    });
    if (!chapter) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });

    let content: { scenes: { id: string; heading: string; body: string }[] };
    if (scenes && Array.isArray(scenes)) {
      content = ChapterContentSchema.parse({ scenes });
    } else {
      const lastVersion = chapter.versions[0];
      const existing = lastVersion ? (JSON.parse(lastVersion.content) as { scenes?: unknown[] }) : null;
      const prompt = existing?.scenes?.length
        ? `Expand these scenes into full prose. Return JSON with scenes (id, heading, body).\n\n${JSON.stringify(existing)}`
        : `Write a full draft for Chapter ${chapter.number}. Return JSON with scenes array.`;
      const provider = getProvider();
      const raw = await provider.generateJSON<unknown>(prompt, "ChapterContent");
      content = ChapterContentSchema.parse(raw);
    }

    const nextVersion = (chapter.versions[0]?.version ?? 0) + 1;
    await prisma.chapterVersion.create({
      data: {
        chapterId,
        content: JSON.stringify(content),
        version: nextVersion,
      },
    });
    return NextResponse.json({ content, version: nextVersion });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to draft chapter" }, { status: 500 });
  }
}
