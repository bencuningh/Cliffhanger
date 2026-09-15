import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getMyShows, STATUS_ORDER, STATUS_LABELS } from "@/lib/my-shows";
import { AddShowSearch } from "@/components/AddShowSearch";
import { ShowCard } from "@/components/ShowCard";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const shows = await getMyShows(session.user.id);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="neon-text mb-3 text-2xl font-bold">My Shows</h1>
        <AddShowSearch />
      </div>

      {shows.length === 0 && (
        <p className="text-text-secondary">
          Nothing tracked yet — search above to add your first show.
        </p>
      )}

      {STATUS_ORDER.map((status) => {
        const group = shows.filter((s) => s.status === status);
        if (group.length === 0) return null;

        return (
          <section key={status} className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-text-primary">
              {STATUS_LABELS[status]}{" "}
              <span className="text-sm font-normal text-text-secondary">({group.length})</span>
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {group.map((entry) => (
                <ShowCard
                  key={entry.userShowId}
                  showId={entry.showId}
                  title={entry.title}
                  posterUrl={entry.posterUrl}
                  watched={entry.watched}
                  total={entry.aired}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
