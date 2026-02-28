import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ seriesId: string; chapterId: string }> }
) {
  try {
    const { chapterId } = await params;
    const chapter = await prisma.chapter.update({
      where: { id: chapterId },
      data: { status: "approved" },
    });
    return NextResponse.json(chapter);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to approve chapter" }, { status: 500 });
  }
}
