import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchActivities, fetchActivityDetail } from "@/lib/strava";

function paceSecondsPerKilometer(distanceMeters: number, movingTime: number) {
  if (!distanceMeters || distanceMeters <= 0) {
    return null;
  }
  return Math.round(movingTime / (distanceMeters / 1000));
}

export async function POST() {
  const athletes = await prisma.athlete.findMany();

  for (const athlete of athletes) {
    const summaries = await fetchActivities(athlete.id, { per_page: 50 });

    for (const summary of summaries) {
      const detail = await fetchActivityDetail(athlete.id, summary.id);
      const pace = paceSecondsPerKilometer(detail.distance, detail.moving_time);

      const activity = await prisma.activity.upsert({
        where: { stravaId: detail.id },
        update: {
          name: detail.name,
          type: detail.sport_type ?? detail.type,
          start_date: new Date(detail.start_date),
          moving_time: detail.moving_time,
          elapsed_time: detail.elapsed_time,
          distance: detail.distance,
          total_elevation_gain: detail.total_elevation_gain,
          average_heartrate: detail.average_heartrate,
          max_heartrate: detail.max_heartrate,
          average_speed: detail.average_speed,
          max_speed: detail.max_speed,
          pace_s_per_km: pace,
          calories: detail.kilojoules ? detail.kilojoules * 0.239006 : detail.calories,
          raw: detail,
        },
        create: {
          athleteId: athlete.id,
          stravaId: detail.id,
          name: detail.name,
          type: detail.sport_type ?? detail.type,
          start_date: new Date(detail.start_date),
          moving_time: detail.moving_time,
          elapsed_time: detail.elapsed_time,
          distance: detail.distance,
          total_elevation_gain: detail.total_elevation_gain,
          average_heartrate: detail.average_heartrate,
          max_heartrate: detail.max_heartrate,
          average_speed: detail.average_speed,
          max_speed: detail.max_speed,
          pace_s_per_km: pace,
          calories: detail.kilojoules ? detail.kilojoules * 0.239006 : detail.calories,
          raw: detail,
        },
      });

      if (detail.splits_metric?.length) {
        await prisma.split.deleteMany({ where: { activityId: activity.id } });
        await prisma.split.createMany({
          data: detail.splits_metric.map((split: any) => ({
            activityId: activity.id,
            km: split.split,
            moving_time: split.moving_time,
            distance: split.distance,
            average_speed: split.average_speed,
            pace_s_per_km: paceSecondsPerKilometer(split.distance, split.moving_time),
          })),
        });
      }

      if (detail.laps?.length) {
        await prisma.lap.deleteMany({ where: { activityId: activity.id } });
        await prisma.lap.createMany({
          data: detail.laps.map((lap: any) => ({
            activityId: activity.id,
            index: lap.lap_index,
            distance: lap.distance,
            moving_time: lap.moving_time,
            average_speed: lap.average_speed,
            pace_s_per_km: paceSecondsPerKilometer(lap.distance, lap.moving_time),
            raw: lap,
          })),
        });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
