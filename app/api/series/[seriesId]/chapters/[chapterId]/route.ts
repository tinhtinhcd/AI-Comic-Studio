import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ seriesId: string; chapterId: string }> }
) {
  try {
    const { chapterId } = await params;
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        versions: { orderBy: { version: "desc" }, take: 1 },
        qcReports: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });
    if (!chapter) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });

    const latestVersion = chapter.versions[0];
    let content: { scenes?: { id: string; heading: string; body: string }[]; script?: string } = {};
    if (latestVersion?.content) {
      try {
        const parsed = JSON.parse(latestVersion.content) as { scenes?: unknown[]; script?: string };
        content = {
          scenes: Array.isArray(parsed.scenes) ? parsed.scenes as { id: string; heading: string; body: string }[] : undefined,
          script: typeof parsed.script === "string" ? parsed.script : undefined,
        };
      } catch {
        content = {};
      }
    }

    let qc: { issues: { type: string; location?: string; description: string; severity?: string }[]; suggestions?: string[]; score?: number } | null = null;
    const latestQC = chapter.qcReports[0];
    if (latestQC?.report) {
      try {
        qc = JSON.parse(latestQC.report) as typeof qc;
      } catch {
        qc = null;
      }
    }

    return NextResponse.json({
      chapter: { id: chapter.id, number: chapter.number, title: chapter.title, status: chapter.status },
      content: { scenes: content.scenes ?? [], script: content.script ?? "", version: latestVersion?.version ?? 0 },
      qc,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to get chapter" }, { status: 500 });
  }
}
