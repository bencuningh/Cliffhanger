import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncShowFromTmdb } from "@/lib/tmdb-sync";

export const maxDuration = 60;

/**
 * Re-syncs metadata (season/episode lists, air dates, show status) from
 * TMDb for every show currently on someone's list. Meant to be hit once a
 * day by Vercel Cron (see vercel.json) — a fresh TMDb read on every page
 * load isn't necessary since air dates rarely change more than once a day.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const trackedShows = await prisma.show.findMany({
    where: { users: { some: {} } },
    select: { tmdbId: true, title: true },
  });

  const results = await Promise.allSettled(
    trackedShows.map((show) => syncShowFromTmdb(show.tmdbId)),
  );

  const failed = results
    .map((result, i) => ({ result, show: trackedShows[i] }))
    .filter(({ result }) => result.status === "rejected")
    .map(({ show }) => show.title);

  return NextResponse.json({
    refreshed: results.length - failed.length,
    failed,
  });
}
