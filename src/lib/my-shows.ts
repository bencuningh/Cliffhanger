import { prisma } from "@/lib/prisma";
import { computeProgress } from "@/lib/progress";
import type { UserShowStatus } from "@prisma/client";

export interface MyShowEntry {
  userShowId: string;
  showId: string;
  title: string;
  posterUrl: string | null;
  status: UserShowStatus;
  watched: number;
  aired: number;
  total: number;
}

export async function getMyShows(userId: string): Promise<MyShowEntry[]> {
  const [userShows, watchedEpisodes] = await Promise.all([
    prisma.userShow.findMany({
      where: { userId },
      orderBy: { addedAt: "desc" },
      include: {
        show: {
          include: { seasons: { include: { episodes: { select: { id: true, airDate: true } } } } },
        },
      },
    }),
    prisma.userEpisode.findMany({ where: { userId }, select: { episodeId: true } }),
  ]);

  const watchedIds = new Set(watchedEpisodes.map((e) => e.episodeId));

  return userShows.map((us) => {
    const episodes = us.show.seasons.flatMap((s) => s.episodes);
    const progress = computeProgress(episodes, watchedIds);
    return {
      userShowId: us.id,
      showId: us.showId,
      title: us.show.title,
      posterUrl: us.show.posterUrl,
      status: us.status,
      watched: progress.watchedCount,
      aired: progress.airedCount,
      total: progress.totalCount,
    };
  });
}

export const STATUS_ORDER: UserShowStatus[] = ["WATCHING", "PLAN_TO_WATCH", "COMPLETED", "DROPPED"];

export const STATUS_LABELS: Record<UserShowStatus, string> = {
  WATCHING: "Watching",
  PLAN_TO_WATCH: "Plan to Watch",
  COMPLETED: "Completed",
  DROPPED: "Dropped",
};
