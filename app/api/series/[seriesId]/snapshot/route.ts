import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getProvider } from "@/lib/ai/provider";
import { runExtractor, mergeSnapshots } from "@/lib/ai/extractor";
import type { ConceptSnapshot, LangCode } from "@/lib/schemas/concept";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ seriesId: string }> }
) {
  try {
    const { seriesId } = await params;
    const latest = await prisma.conceptSnapshot.findFirst({
      where: { seriesId },
      orderBy: { createdAt: "desc" },
    });
    if (!latest) return NextResponse.json(null);
    const data: ConceptSnapshot = latest.data ? JSON.parse(latest.data) : {};
    return NextResponse.json({ id: latest.id, ...data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to get snapshot" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ seriesId: string }> }
) {
  try {
    const { seriesId } = await params;
    const body = await req.json();

    const series = await prisma.series.findUnique({ where: { id: seriesId } });
    const primaryLang = (series?.primaryLanguage || "auto") as LangCode;
    const outputLang = (series?.preferredOutputLanguage || "auto") as LangCode;

    if (body.extract) {
      const messages = await prisma.message.findMany({
        where: { seriesId },
        orderBy: { createdAt: "asc" },
      });
      const chatMessages = messages.map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      }));

      const provider = getProvider();
      const extracted = await runExtractor(provider, chatMessages, {
        primaryLanguage: primaryLang,
        preferredOutputLanguage: outputLang,
      });

      const existingRow = await prisma.conceptSnapshot.findFirst({
        where: { seriesId },
        orderBy: { createdAt: "desc" },
      });
      const existingSnapshot: ConceptSnapshot | null = existingRow?.data
        ? JSON.parse(existingRow.data)
        : null;

      const merged = mergeSnapshots(existingSnapshot, extracted);

      const snapshot = await prisma.conceptSnapshot.create({
        data: { seriesId, data: JSON.stringify(merged) },
      });
      return NextResponse.json({ id: snapshot.id, ...merged });
    }

    const existingRow = await prisma.conceptSnapshot.findFirst({
      where: { seriesId },
      orderBy: { createdAt: "desc" },
    });
    const existingSnapshot: ConceptSnapshot | null = existingRow?.data
      ? JSON.parse(existingRow.data)
      : null;
    const merged = mergeSnapshots(existingSnapshot, body);

    const snapshot = await prisma.conceptSnapshot.create({
      data: { seriesId, data: JSON.stringify(merged) },
    });
    return NextResponse.json({ id: snapshot.id, ...merged });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update snapshot" }, { status: 500 });
  }
}
