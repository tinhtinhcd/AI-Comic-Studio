import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getProvider } from "@/lib/ai/provider";
import { OutlineSchema } from "@/lib/schemas";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ seriesId: string }> }
) {
  try {
    const { seriesId } = await params;
    const outline = await prisma.outline.findFirst({
      where: { seriesId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(outline || null);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to get outline" }, { status: 500 });
  }
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ seriesId: string }> }
) {
  try {
    const { seriesId } = await params;
    const snapshot = await prisma.conceptSnapshot.findFirst({
      where: { seriesId },
      orderBy: { createdAt: "desc" },
    });
    const context = snapshot
      ? `Bible: ${snapshot.bible}\nCharacters: ${snapshot.characters}\nWorld: ${snapshot.world}\nThemes: ${snapshot.themes}`
      : "No concept yet. Generate a generic 3-act outline.";

    const prompt = `Generate a story outline (acts, beats, chapter summaries) from this concept. Return valid JSON.\n\n${context}`;
    const provider = getProvider();
    const raw = await provider.generateJSON<unknown>(prompt, "Outline");
    const parsed = OutlineSchema.parse(raw);

    const outline = await prisma.outline.create({
      data: {
        seriesId,
        structure: JSON.stringify(parsed),
      },
    });
    return NextResponse.json(outline);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to generate outline" }, { status: 500 });
  }
}
