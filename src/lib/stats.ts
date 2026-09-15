import { prisma } from "@/lib/prisma";

export interface UserStats {
  totalEpisodesWatched: number;
  totalWatchMinutes: number;
  showsCompletedThisYear: number;
}

export async function getUserStats(userId: string): Promise<UserStats> {
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);

  const [watchedEpisodes, showsCompletedThisYear] = await Promise.all([
    prisma.userEpisode.findMany({
      where: { userId },
      select: {
        episode: {
          select: { runtimeMins: true, season: { select: { show: { select: { runtimeMins: true } } } } },
        },
      },
    }),
    prisma.userShow.count({
      where: { userId, status: "COMPLETED", completedAt: { gte: startOfYear } },
    }),
  ]);

  const totalWatchMinutes = watchedEpisodes.reduce((sum, { episode }) => {
    const minutes = episode.runtimeMins ?? episode.season.show.runtimeMins ?? 0;
    return sum + minutes;
  }, 0);

  return {
    totalEpisodesWatched: watchedEpisodes.length,
    totalWatchMinutes,
    showsCompletedThisYear,
  };
}

export function formatWatchTime(totalMinutes: number): string {
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (days === 0 && minutes > 0) parts.push(`${minutes}m`);

  return parts.length > 0 ? parts.join(" ") : "0m";
}
