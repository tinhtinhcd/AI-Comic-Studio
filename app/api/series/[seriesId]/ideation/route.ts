import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getProvider } from "@/lib/ai/provider";

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

    await prisma.message.create({
      data: { seriesId, role: "user", content },
    });

    const messages = await prisma.message.findMany({
      where: { seriesId },
      orderBy: { createdAt: "asc" },
    });
    const chatMessages = messages.map((m) => ({ role: m.role as "user" | "assistant" | "system", content: m.content }));

    const provider = getProvider();
    const reply = await provider.chat(chatMessages);

    await prisma.message.create({
      data: { seriesId, role: "assistant", content: reply },
    });

    return NextResponse.json({ reply });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Ideation failed" }, { status: 500 });
  }
}
