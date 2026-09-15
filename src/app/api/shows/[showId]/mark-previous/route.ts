import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Marks every episode of a show up to and including `throughEpisodeId` as
 * watched, ordered by season number then episode number. Used for the
 * "mark all previous as watched" shortcut on the show detail page.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ showId: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { showId } = await params;
  const body = await request.json().catch(() => null);
  const throughEpisodeId = body?.throughEpisodeId as string | undefined;
  if (!throughEpisodeId) {
    return NextResponse.json({ error: "throughEpisodeId is required" }, { status: 400 });
  }

  const allEpisodes = await prisma.episode.findMany({
    where: { season: { showId } },
    orderBy: [{ season: { seasonNumber: "asc" } }, { episodeNumber: "asc" }],
    select: { id: true },
  });

  const cutoffIndex = allEpisodes.findIndex((e) => e.id === throughEpisodeId);
  if (cutoffIndex === -1) {
    return NextResponse.json({ error: "Episode not found on this show" }, { status: 404 });
  }

  const episodeIds = allEpisodes.slice(0, cutoffIndex + 1).map((e) => e.id);

  await prisma.$transaction(
    episodeIds.map((episodeId) =>
      prisma.userEpisode.upsert({
        where: { userId_episodeId: { userId: session.user.id, episodeId } },
        create: { userId: session.user.id, episodeId },
        update: {},
      }),
    ),
  );

  return NextResponse.json({ markedCount: episodeIds.length });
}
