import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { authOptions } from "@/lib/auth";
import { getUpNext } from "@/lib/up-next";

function formatDateHeading(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((date.getTime() - today.getTime()) / 86_400_000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return date.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

export default async function UpNextPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const entries = await getUpNext(session.user.id);

  const groups = new Map<string, typeof entries>();
  for (const entry of entries) {
    const key = entry.airDate.toDateString();
    const group = groups.get(key);
    if (group) group.push(entry);
    else groups.set(key, [entry]);
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="neon-text text-2xl font-bold">Up Next</h1>

      {entries.length === 0 && (
        <p className="text-text-secondary">
          No upcoming episodes for shows you&apos;re watching. New air dates show up here once
          TMDb has them.
        </p>
      )}

      {[...groups.entries()].map(([dateKey, group]) => (
        <section key={dateKey} className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-neon-light">
            {formatDateHeading(group[0].airDate)}
          </h2>
          <div className="flex flex-col divide-y divide-bg-surface-hover rounded-lg bg-bg-surface">
            {group.map((entry) => (
              <Link
                key={entry.episodeId}
                href={`/shows/${entry.showId}`}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-bg-surface-hover"
              >
                <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded bg-bg-surface-hover">
                  {entry.posterUrl && (
                    <Image src={entry.posterUrl} alt={entry.showTitle} fill sizes="40px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{entry.showTitle}</p>
                  <p className="truncate text-xs text-text-secondary">
                    S{entry.seasonNumber}E{entry.episodeNumber} · {entry.episodeTitle}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
