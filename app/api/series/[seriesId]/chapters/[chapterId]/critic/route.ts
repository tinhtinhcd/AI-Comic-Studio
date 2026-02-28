import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getProvider } from "@/lib/ai/provider";
import { QCReportSchema } from "@/lib/schemas";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ seriesId: string; chapterId: string }> }
) {
  try {
    const { chapterId } = await params;
    const version = await prisma.chapterVersion.findFirst({
      where: { chapterId },
      orderBy: { version: "desc" },
    });
    if (!version) return NextResponse.json({ error: "No chapter content to critique" }, { status: 400 });

    const prompt = `Run a quality check on this chapter. Return JSON with issues (array of {type, location?, description, severity?}), suggestions (string array), score (0-100).\n\n${version.content}`;
    const provider = getProvider();
    const raw = await provider.generateJSON<unknown>(prompt, "QCReport");
    const parsedResult = QCReportSchema.safeParse(
      typeof raw === "object" && raw !== null && "issues" in (raw as object) ? raw : { issues: [], suggestions: [], score: 75 }
    );
    const parsed = parsedResult.success ? parsedResult.data : { issues: [], suggestions: ["Review pacing and clarity."], score: 75 };

    const report = await prisma.qCReport.create({
      data: {
        chapterId,
        report: JSON.stringify(parsed),
      },
    });
    return NextResponse.json({ report, ...parsed });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to run critic" }, { status: 500 });
  }
}
