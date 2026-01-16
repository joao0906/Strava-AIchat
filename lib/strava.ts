import { prisma } from "@/lib/prisma";

type QueryValue = string | number | boolean | undefined | null;

export async function ensureFreshToken(athleteId: string): Promise<string> {
  const athlete = await prisma.athlete.findUnique({ where: { id: athleteId } });
  if (!athlete) {
    throw new Error("athlete not found");
  }

  const now = Math.floor(Date.now() / 1000);
  if (athlete.expiresAt && athlete.expiresAt - now > 120) {
    return athlete.accessToken;
  }

  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: athlete.refreshToken,
    }),
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(`failed to refresh Strava token: ${res.status} ${message}`);
  }

  const json = await res.json();
  const accessToken = json.access_token as string;
  const refreshToken = (json.refresh_token as string | undefined) ?? athlete.refreshToken;
  const expiresAt = json.expires_at as number;

  await prisma.athlete.update({
    where: { id: athleteId },
    data: {
      accessToken,
      refreshToken,
      expiresAt,
    },
  });

  return accessToken;
}

export async function refreshAthleteToken(athleteId: string, refreshToken: string) {
  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(`failed to refresh Strava token: ${res.status} ${message}`);
  }

  const json = await res.json();
  await prisma.athlete.update({
    where: { id: athleteId },
    data: {
      accessToken: json.access_token,
      refreshToken: json.refresh_token ?? refreshToken,
      expiresAt: json.expires_at,
    },
  });
}

async function stravaApi<T>(athleteId: string, path: string, query?: Record<string, QueryValue>): Promise<T> {
  const token = await ensureFreshToken(athleteId);
  const params = new URLSearchParams();

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
  }

  const qs = params.toString();
  const endpoint = `https://www.strava.com/api/v3${path}${qs ? `?${qs}` : ""}`;
  const res = await fetch(endpoint, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(`Strava API error ${res.status}: ${message}`);
  }

  return (await res.json()) as T;
}

export async function fetchActivities(athleteId: string, query: Record<string, QueryValue> = {}) {
  return stravaApi<any[]>(athleteId, "/athlete/activities", query);
}

export async function fetchActivityDetail(athleteId: string, id: number) {
  return stravaApi<any>(athleteId, `/activities/${id}`, { include_all_efforts: true });
}
