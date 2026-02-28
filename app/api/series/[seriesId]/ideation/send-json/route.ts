import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getProvider } from "@/lib/ai/provider";
import { runExtractor, mergeSnapshots, detectLanguage, buildChatSystemPrompt } from "@/lib/ai/extractor";
import type { ConceptSnapshot } from "@/lib/schemas/concept";
import type { LangCode } from "@/lib/schemas/concept";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ seriesId: string }> }
) {
  try {
    const { seriesId } = await params;
    const { content } = await req.json();
    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "content required" }, { status: 400 });
    }

    const series = await prisma.series.findUnique({ where: { id: seriesId } });
    if (!series) return NextResponse.json({ error: "Series not found" }, { status: 404 });

    const primaryLang = (series.primaryLanguage || "auto") as LangCode;
    const outputLang = (series.preferredOutputLanguage || "auto") as LangCode;

    const msgLang = detectLanguage(content);

    await prisma.message.create({
      data: { seriesId, role: "user", content, language: msgLang },
    });

    const messages = await prisma.message.findMany({
      where: { seriesId },
      orderBy: { createdAt: "asc" },
    });

    const systemPrompt = buildChatSystemPrompt({ primaryLanguage: primaryLang, preferredOutputLanguage: outputLang });
    const chatMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      })),
    ];

    const provider = getProvider();
    const reply = await provider.chat(chatMessages);
    const replyLang = detectLanguage(reply);

    const assistantMsg = await prisma.message.create({
      data: { seriesId, role: "assistant", content: reply, language: replyLang },
    });

    const allMessages = chatMessages.concat({ role: "assistant", content: reply });
    let snapshotData: ConceptSnapshot | null = null;
    try {
      const extracted = await runExtractor(provider, allMessages, {
        primaryLanguage: primaryLang === "auto" ? (msgLang as LangCode) : primaryLang,
        preferredOutputLanguage: outputLang,
      });
      extracted.lastUpdatedFromMessageId = assistantMsg.id;
      extracted.language = extracted.language || msgLang;

      const existingRow = await prisma.conceptSnapshot.findFirst({
        where: { seriesId },
        orderBy: { createdAt: "desc" },
      });
      const existingSnapshot: ConceptSnapshot | null = existingRow?.data
        ? JSON.parse(existingRow.data)
        : null;

      snapshotData = mergeSnapshots(existingSnapshot, extracted);

      await prisma.conceptSnapshot.create({
        data: { seriesId, data: JSON.stringify(snapshotData) },
      });
    } catch (extractErr) {
      console.error("Extractor pass failed (non-fatal):", extractErr);
    }

    const updatedMessages = await prisma.message.findMany({
      where: { seriesId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      messages: updatedMessages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        language: m.language,
      })),
      snapshot: snapshotData,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Ideation failed" }, { status: 500 });
  }
}
