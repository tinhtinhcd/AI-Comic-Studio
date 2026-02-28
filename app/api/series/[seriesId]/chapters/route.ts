import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ seriesId: string }> }
) {
  try {
    const { seriesId } = await params;
    const chapters = await prisma.chapter.findMany({
      where: { seriesId },
      orderBy: { number: "asc" },
      include: { versions: { orderBy: { version: "desc" }, take: 1 } },
    });
    return NextResponse.json(chapters);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to list chapters" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ seriesId: string }> }
) {
  try {
    const { seriesId } = await params;
    const { number, title, outlineId } = await req.json();
    const max = await prisma.chapter.aggregate({
      where: { seriesId },
      _max: { number: true },
    });
    const chapter = await prisma.chapter.create({
      data: {
        seriesId,
        outlineId: outlineId || null,
        number: number ?? (max._max.number ?? 0) + 1,
        title: title || `Chapter ${number ?? (max._max.number ?? 0) + 1}`,
      },
    });
    return NextResponse.json(chapter);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create chapter" }, { status: 500 });
  }
}
