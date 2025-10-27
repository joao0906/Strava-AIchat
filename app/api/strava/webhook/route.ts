import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const challenge = url.searchParams.get("hub.challenge");
  const verifyToken = url.searchParams.get("hub.verify_token");

  if (verifyToken !== process.env.STRAVA_WEBHOOK_VERIFY_TOKEN) {
    return NextResponse.json({ error: "invalid verify token" }, { status: 401 });
  }

  return NextResponse.json({ "hub.challenge": challenge });
}

export async function POST(req: NextRequest) {
  const payload = await req.json();
  await prisma.webhookEvent.create({
    data: {
      type: payload.aspect_type ?? payload.object_type ?? "unknown",
      payload,
    },
  });

  return NextResponse.json({ received: true });
}
