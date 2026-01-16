import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { refreshAthleteToken } from "@/lib/strava";

export async function POST() {
  const athletes = await prisma.athlete.findMany({ select: { id: true, refreshToken: true } });
  await Promise.all(
    athletes.map((athlete) => refreshAthleteToken(athlete.id, athlete.refreshToken)),
  );
  return NextResponse.json({ ok: true });
}
