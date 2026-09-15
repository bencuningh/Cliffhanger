import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { syncShowFromTmdb } from "@/lib/tmdb-sync";
import type { UserShowStatus } from "@prisma/client";

const VALID_STATUSES: UserShowStatus[] = ["WATCHING", "PLAN_TO_WATCH", "COMPLETED", "DROPPED"];

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const tmdbId = Number(body?.tmdbId);
  const status: UserShowStatus = VALID_STATUSES.includes(body?.status) ? body.status : "PLAN_TO_WATCH";

  if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
    return NextResponse.json({ error: "A valid tmdbId is required." }, { status: 400 });
  }

  const show = await syncShowFromTmdb(tmdbId);

  const userShow = await prisma.userShow.upsert({
    where: { userId_showId: { userId: session.user.id, showId: show.id } },
    create: { userId: session.user.id, showId: show.id, status },
    update: { status },
  });

  return NextResponse.json({ userShow, show }, { status: 201 });
}
