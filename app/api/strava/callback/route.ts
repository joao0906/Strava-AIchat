import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "missing code" }, { status: 400 });
  }

  const tokenRes = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    return NextResponse.json({ error: "strava_token_exchange_failed", detail: text }, { status: 502 });
  }

  const tokenJson = await tokenRes.json();
  const { athlete, access_token, refresh_token, expires_at } = tokenJson;

  await prisma.athlete.upsert({
    where: { stravaId: athlete.id },
    update: {
      userId: (session.user as { id: string }).id,
      username: athlete.username,
      firstname: athlete.firstname,
      lastname: athlete.lastname,
      city: athlete.city,
      country: athlete.country,
      sex: athlete.sex,
      profile: athlete.profile,
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: expires_at,
    },
    create: {
      userId: (session.user as { id: string }).id,
      stravaId: athlete.id,
      username: athlete.username,
      firstname: athlete.firstname,
      lastname: athlete.lastname,
      city: athlete.city,
      country: athlete.country,
      sex: athlete.sex,
      profile: athlete.profile,
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: expires_at,
    },
  });

  return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard`);
}
