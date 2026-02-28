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
      include: { versions: { orderBy: { version: "desc" }, take: 1 } },
    });
    if (!chapter) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });

    const lastVersion = chapter.versions[0];
    const existing = lastVersion ? (JSON.parse(lastVersion.content) as { scenes?: unknown[] }) : null;
    const prompt = existing?.scenes?.length
      ? `Expand these scenes into full prose. Return JSON with scenes (id, heading, body) and optional script (full chapter as markdown).\n\n${JSON.stringify(existing)}`
      : `Write a full draft for Chapter ${chapter.number}. Return JSON with scenes array and optional script (markdown).`;

    const provider = getProvider();
    const raw = await provider.generateJSON<unknown>(prompt, "ChapterContent");
    const parsedResult = ChapterContentSchema.safeParse(raw);
    const content = parsedResult.success ? parsedResult.data : { scenes: (existing?.scenes ?? []) as { heading?: string; body?: string }[] };
    const scenesList = content.scenes ?? [];
    const script =
      typeof raw === "object" && raw !== null && "script" in (raw as object) && typeof (raw as { script: unknown }).script === "string"
        ? (raw as { script: string }).script
        : scenesList.map((s: { heading?: string; body?: string }) => `## ${s.heading ?? ""}\n\n${s.body ?? ""}`).join("\n\n");

    const payload = { scenes: content.scenes, script };
    const nextVersion = (lastVersion?.version ?? 0) + 1;
    await prisma.chapterVersion.create({
      data: { chapterId: chapter.id, content: JSON.stringify(payload), version: nextVersion },
    });
    return NextResponse.json({ content: payload, version: nextVersion, chapterId: chapter.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to draft chapter" }, { status: 500 });
  }
}
