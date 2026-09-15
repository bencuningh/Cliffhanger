import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Image from "next/image";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeProgress } from "@/lib/progress";
import { ProgressBar } from "@/components/ProgressBar";
import { StatusSelect } from "@/components/StatusSelect";
import { SeasonList } from "@/components/SeasonList";

export default async function ShowDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { id } = await params;

  const [show, userShow, watchedEpisodes] = await Promise.all([
    prisma.show.findUnique({
      where: { id },
      include: { seasons: { include: { episodes: true }, orderBy: { seasonNumber: "asc" } } },
    }),
    prisma.userShow.findUnique({ where: { userId_showId: { userId: session.user.id, showId: id } } }),
    prisma.userEpisode.findMany({
      where: { userId: session.user.id, episode: { season: { showId: id } } },
      select: { episodeId: true },
    }),
  ]);

  if (!show) notFound();

  const watchedIds = new Set(watchedEpisodes.map((e) => e.episodeId));
  const allEpisodes = show.seasons.flatMap((s) => s.episodes);
  const progress = computeProgress(allEpisodes, watchedIds);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative aspect-2/3 w-32 shrink-0 overflow-hidden rounded-lg bg-bg-surface sm:w-48">
          {show.posterUrl && (
            <Image src={show.posterUrl} alt={show.title} fill sizes="192px" className="object-cover" />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-3">
          <h1 className="neon-text text-2xl font-bold sm:text-3xl">{show.title}</h1>
          {userShow && <StatusSelect userShowId={userShow.id} initialStatus={userShow.status} />}
          <ProgressBar watched={progress.watchedCount} total={progress.airedCount} />
          {show.overview && <p className="text-sm text-text-secondary">{show.overview}</p>}
        </div>
      </div>

      <SeasonList
        showId={show.id}
        seasons={show.seasons.map((s) => ({
          id: s.id,
          seasonNumber: s.seasonNumber,
          episodes: s.episodes.map((e) => ({
            id: e.id,
            episodeNumber: e.episodeNumber,
            title: e.title,
            airDate: e.airDate?.toISOString() ?? null,
            watched: watchedIds.has(e.id),
          })),
        }))}
      />
    </div>
  );
}
