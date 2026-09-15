import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { UserShowStatus } from "@prisma/client";

const VALID_STATUSES: UserShowStatus[] = ["WATCHING", "PLAN_TO_WATCH", "COMPLETED", "DROPPED"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userShowId: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userShowId } = await params;
  const body = await request.json().catch(() => null);
  if (!VALID_STATUSES.includes(body?.status)) {
    return NextResponse.json({ error: "A valid status is required." }, { status: 400 });
  }

  const existing = await prisma.userShow.findUnique({ where: { id: userShowId } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const userShow = await prisma.userShow.update({
    where: { id: userShowId },
    data: { status: body.status },
  });

  return NextResponse.json({ userShow });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ userShowId: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userShowId } = await params;
  const existing = await prisma.userShow.findUnique({ where: { id: userShowId } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.userShow.delete({ where: { id: userShowId } });
  return NextResponse.json({ ok: true });
}
