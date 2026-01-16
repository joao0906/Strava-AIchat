import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function average(values: number[]) {
  if (values.length === 0) {
    return null;
  }
  const sum = values.reduce((acc, value) => acc + value, 0);
  return sum / values.length;
}

export async function POST() {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const athletes = await prisma.athlete.findMany({
    include: {
      user: true,
      activities: {
        where: { start_date: { gte: oneWeekAgo } },
      },
    },
  });

  const digests = athletes.map((athlete) => {
    const activities = athlete.activities;
    const km = activities.reduce((acc, activity) => acc + (activity.distance ?? 0), 0) / 1000;
    const moving = activities.reduce((acc, activity) => acc + (activity.moving_time ?? 0), 0);
    const paces = activities
      .map((activity) => activity.pace_s_per_km)
      .filter((pace): pace is number => typeof pace === "number" && pace > 0);

    return {
      athleteId: athlete.id,
      userEmail: athlete.user?.email,
      totalSessions: activities.length,
      totalKm: Number(km.toFixed(1)),
      movingMinutes: Math.round(moving / 60),
      avgPaceSeconds: average(paces),
    };
  });

  // Aqui você pode conectar serviços como Resend, Web Push ou Telegram usando `digests`.
  // Para manter o starter kit enxuto, apenas retornamos os cálculos.

  return NextResponse.json({ digests });
}
