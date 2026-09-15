import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getUserStats, formatWatchTime } from "@/lib/stats";

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg bg-bg-surface p-6">
      <span className="neon-text text-3xl font-bold">{value}</span>
      <span className="text-sm text-text-secondary">{label}</span>
    </div>
  );
}

export default async function StatsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const stats = await getUserStats(session.user.id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="neon-text text-2xl font-bold">Stats</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Episodes watched" value={stats.totalEpisodesWatched.toLocaleString()} />
        <StatTile label="Time watched" value={formatWatchTime(stats.totalWatchMinutes)} />
        <StatTile
          label={`Shows completed in ${new Date().getFullYear()}`}
          value={stats.showsCompletedThisYear.toLocaleString()}
        />
      </div>
    </div>
  );
}
