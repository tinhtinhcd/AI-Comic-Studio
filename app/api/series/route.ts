import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const series = await prisma.series.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        _count: { select: { chapters: true, messages: true } },
      },
    });
    return NextResponse.json(series);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to list series" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { title, mode, primaryLanguage, preferredOutputLanguage } = await req.json();
    const series = await prisma.series.create({
      data: {
        title: title || "Untitled Series",
        mode: mode || "ideation",
        primaryLanguage: primaryLanguage || "auto",
        preferredOutputLanguage: preferredOutputLanguage || "auto",
      },
    });
    return NextResponse.json(series);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create series" }, { status: 500 });
  }
}
