import { prisma } from "@/lib/prisma";

export interface UpNextEntry {
  showId: string;
  showTitle: string;
  posterUrl: string | null;
  episodeId: string;
  episodeNumber: number;
  seasonNumber: number;
  episodeTitle: string;
  airDate: Date;
}

/** Upcoming (and today's) episodes for shows the user is actively watching, soonest first. */
export async function getUpNext(userId: string): Promise<UpNextEntry[]> {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const userShows = await prisma.userShow.findMany({
    where: { userId, status: "WATCHING" },
    select: {
      show: {
        select: {
          id: true,
          title: true,
          posterUrl: true,
          seasons: {
            select: {
              seasonNumber: true,
              episodes: {
                where: { airDate: { gte: startOfToday } },
                select: { id: true, episodeNumber: true, title: true, airDate: true },
              },
            },
          },
        },
      },
    },
  });

  const entries: UpNextEntry[] = [];
  for (const { show } of userShows) {
    for (const season of show.seasons) {
      for (const ep of season.episodes) {
        if (!ep.airDate) continue;
        entries.push({
          showId: show.id,
          showTitle: show.title,
          posterUrl: show.posterUrl,
          episodeId: ep.id,
          episodeNumber: ep.episodeNumber,
          seasonNumber: season.seasonNumber,
          episodeTitle: ep.title,
          airDate: ep.airDate,
        });
      }
    }
  }

  entries.sort((a, b) => a.airDate.getTime() - b.airDate.getTime());
  return entries;
}
