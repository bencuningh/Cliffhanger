import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Toggles the watched state of a single episode for the current user. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ episodeId: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { episodeId } = await params;
  const body = await request.json().catch(() => ({}));
  const watched = Boolean(body?.watched);

  const episode = await prisma.episode.findUnique({ where: { id: episodeId } });
  if (!episode) {
    return NextResponse.json({ error: "Episode not found" }, { status: 404 });
  }

  if (watched) {
    await prisma.userEpisode.upsert({
      where: { userId_episodeId: { userId: session.user.id, episodeId } },
      create: { userId: session.user.id, episodeId },
      update: {},
    });
  } else {
    await prisma.userEpisode.deleteMany({
      where: { userId: session.user.id, episodeId },
    });
  }

  return NextResponse.json({ watched });
}
