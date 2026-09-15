import { prisma } from "@/lib/prisma";
import { getSeasonDetails, getTvShowDetails, tmdbImageUrl } from "@/lib/tmdb";
import type { ShowStatus } from "@prisma/client";

const STATUS_MAP: Record<string, ShowStatus> = {
  "Returning Series": "RETURNING",
  Ended: "ENDED",
  Canceled: "CANCELED",
  "In Production": "IN_PRODUCTION",
  Planned: "PLANNED",
};

function mapStatus(tmdbStatus: string): ShowStatus {
  return STATUS_MAP[tmdbStatus] ?? "UNKNOWN";
}

/**
 * Fetches a show (and all of its seasons/episodes) from TMDb and upserts it
 * into our own tables, so subsequent page loads read from our DB instead of
 * hitting TMDb every time. Safe to call repeatedly — used both when a show
 * is first added and by the daily refresh cron.
 */
export async function syncShowFromTmdb(tmdbId: number) {
  const details = await getTvShowDetails(tmdbId);

  const show = await prisma.show.upsert({
    where: { tmdbId },
    create: {
      tmdbId,
      title: details.name,
      overview: details.overview || null,
      posterUrl: tmdbImageUrl(details.poster_path),
      backdropUrl: tmdbImageUrl(details.backdrop_path, "original"),
      status: mapStatus(details.status),
      firstAirDate: details.first_air_date ? new Date(details.first_air_date) : null,
      runtimeMins: details.episode_run_time[0] ?? null,
    },
    update: {
      title: details.name,
      overview: details.overview || null,
      posterUrl: tmdbImageUrl(details.poster_path),
      backdropUrl: tmdbImageUrl(details.backdrop_path, "original"),
      status: mapStatus(details.status),
      firstAirDate: details.first_air_date ? new Date(details.first_air_date) : null,
      runtimeMins: details.episode_run_time[0] ?? null,
      lastSyncedAt: new Date(),
    },
  });

  for (const seasonSummary of details.seasons) {
    const season = await prisma.season.upsert({
      where: { showId_seasonNumber: { showId: show.id, seasonNumber: seasonSummary.season_number } },
      create: {
        showId: show.id,
        tmdbId: seasonSummary.id,
        seasonNumber: seasonSummary.season_number,
        episodeCount: seasonSummary.episode_count,
        posterUrl: tmdbImageUrl(seasonSummary.poster_path),
      },
      update: {
        episodeCount: seasonSummary.episode_count,
        posterUrl: tmdbImageUrl(seasonSummary.poster_path),
      },
    });

    const seasonDetails = await getSeasonDetails(tmdbId, seasonSummary.season_number);
    for (const ep of seasonDetails.episodes) {
      await prisma.episode.upsert({
        where: { seasonId_episodeNumber: { seasonId: season.id, episodeNumber: ep.episode_number } },
        create: {
          seasonId: season.id,
          tmdbId: ep.id,
          episodeNumber: ep.episode_number,
          title: ep.name,
          overview: ep.overview || null,
          airDate: ep.air_date ? new Date(ep.air_date) : null,
          runtimeMins: ep.runtime,
        },
        update: {
          title: ep.name,
          overview: ep.overview || null,
          airDate: ep.air_date ? new Date(ep.air_date) : null,
          runtimeMins: ep.runtime,
        },
      });
    }
  }

  return prisma.show.findUniqueOrThrow({
    where: { id: show.id },
    include: { seasons: { orderBy: { seasonNumber: "asc" }, include: { episodes: { orderBy: { episodeNumber: "asc" } } } } },
  });
}
