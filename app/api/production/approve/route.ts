import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { seriesId, chapterIndex } = body;
    if (!seriesId || chapterIndex == null) {
      return NextResponse.json({ error: "seriesId and chapterIndex required" }, { status: 400 });
    }
    const chapter = await prisma.chapter.findFirst({
      where: { seriesId, number: Number(chapterIndex) },
    });
    if (!chapter) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });

    const updated = await prisma.chapter.update({
      where: { id: chapter.id },
      data: { status: "approved" },
    });
    return NextResponse.json({ status: updated.status, chapterId: chapter.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to approve chapter" }, { status: 500 });
  }
}
