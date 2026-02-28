import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { ConceptSnapshot } from "@/lib/schemas/concept";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ seriesId: string }> }
) {
  try {
    const { seriesId } = await params;
    const series = await prisma.series.findUnique({
      where: { id: seriesId },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
        conceptSnapshots: { orderBy: { createdAt: "desc" }, take: 1 },
        outlines: { orderBy: { createdAt: "desc" }, take: 1 },
        chapters: { orderBy: { number: "asc" } },
      },
    });
    if (!series) return NextResponse.json({ error: "Series not found" }, { status: 404 });

    const latestSnapshotRow = series.conceptSnapshots[0];
    let snapshot: (ConceptSnapshot & { id: string }) | null = null;
    if (latestSnapshotRow?.data) {
      const parsed: ConceptSnapshot = JSON.parse(latestSnapshotRow.data);
      snapshot = { id: latestSnapshotRow.id, ...parsed };
    }

    return NextResponse.json({
      ...series,
      snapshot,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to get series" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ seriesId: string }> }
) {
  try {
    const { seriesId } = await params;
    const body = await req.json();

    const updateData: Record<string, string> = {};
    if (body.primaryLanguage !== undefined) updateData.primaryLanguage = body.primaryLanguage;
    if (body.preferredOutputLanguage !== undefined) updateData.preferredOutputLanguage = body.preferredOutputLanguage;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.mode !== undefined) updateData.mode = body.mode;

    const series = await prisma.series.update({
      where: { id: seriesId },
      data: updateData,
    });
    return NextResponse.json(series);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update series" }, { status: 500 });
  }
}
