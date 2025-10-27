import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function formatPace(seconds: number | null | undefined) {
  if (!seconds || seconds <= 0) {
    return "-";
  }
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec.toString().padStart(2, "0")}/km`;
}

async function summarizePaceTrends(userId: string) {
  const activities = await prisma.activity.findMany({
    where: { athlete: { userId } },
    orderBy: { start_date: "desc" },
    take: 60,
  });

  const runs = activities.filter((activity) => {
    const type = activity.type?.toLowerCase() ?? "";
    return type.includes("run") || type.includes("corrida");
  });

  if (runs.length === 0) {
    return "Sem atividades de corrida suficientes ainda.";
  }

  const averagePace = (list: typeof runs) => {
    const paces = list.map((item) => item.pace_s_per_km).filter(Boolean) as number[];
    if (paces.length === 0) {
      return null;
    }
    return Math.round(paces.reduce((acc, pace) => acc + pace, 0) / paces.length);
  };

  const recent = runs.slice(0, 10);
  const previous = runs.slice(10, 20);
  const paceNow = averagePace(recent);
  const pacePrev = averagePace(previous);

  let delta = 0;
  if (paceNow && pacePrev) {
    delta = Math.round(((pacePrev - paceNow) / pacePrev) * 100);
  }

  return `Pace médio (últimas 10 corridas): ${formatPace(paceNow)}. Variação vs. anteriores: ${delta}%`;
}

async function getRecentActivities(userId: string, limit: number) {
  const activities = await prisma.activity.findMany({
    where: { athlete: { userId } },
    orderBy: { start_date: "desc" },
    take: Math.min(limit, 50),
  });

  return activities.map((activity) => ({
    id: activity.stravaId,
    date: activity.start_date,
    name: activity.name,
    distance_km: Number((activity.distance / 1000).toFixed(2)),
    pace: formatPace(activity.pace_s_per_km ?? undefined),
  }));
}

async function getWeeklyLoad(userId: string) {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const activities = await prisma.activity.findMany({
    where: { athlete: { userId }, start_date: { gte: since } },
  });

  const distance = activities.reduce((acc, activity) => acc + (activity.distance ?? 0), 0) / 1000;
  const movingTime = activities.reduce((acc, activity) => acc + (activity.moving_time ?? 0), 0);

  return {
    km: Number(distance.toFixed(1)),
    moving_minutes: Math.round(movingTime / 60),
    sessions: activities.length,
  };
}

export async function POST(req: NextRequest) {
  const { userId, message } = await req.json();
  const text = (message as string | undefined)?.toLowerCase() ?? "";

  if (!userId) {
    return NextResponse.json({ error: "missing userId" }, { status: 400 });
  }

  if (text.includes("últim") || text.includes("recent")) {
    const data = await getRecentActivities(userId, 5);
    return NextResponse.json({ role: "tool", name: "getRecentActivities", data });
  }

  if (text.includes("ritmo") || text.includes("pace") || text.includes("tend")) {
    const data = await summarizePaceTrends(userId);
    return NextResponse.json({ role: "tool", name: "getPaceTrend", data });
  }

  if (text.includes("semana") || text.includes("carga") || text.includes("volume")) {
    const data = await getWeeklyLoad(userId);
    return NextResponse.json({ role: "tool", name: "getWeeklyLoad", data });
  }

  return NextResponse.json({
    role: "assistant",
    content:
      "Pergunte sobre suas últimas corridas, tendência de pace ou carga semanal que eu busco nos seus dados Strava sincronizados!",
  });
}
