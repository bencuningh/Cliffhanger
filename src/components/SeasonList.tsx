"use client";

import { useState } from "react";

export interface EpisodeVM {
  id: string;
  episodeNumber: number;
  title: string;
  airDate: string | null;
  watched: boolean;
}

export interface SeasonVM {
  id: string;
  seasonNumber: number;
  episodes: EpisodeVM[];
}

function formatAirDate(airDate: string | null) {
  if (!airDate) return "TBA";
  return new Date(airDate).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function SeasonList({ showId, seasons }: { showId: string; seasons: SeasonVM[] }) {
  const [watchedIds, setWatchedIds] = useState<Set<string>>(
    () => new Set(seasons.flatMap((s) => s.episodes).filter((e) => e.watched).map((e) => e.id)),
  );
  const [pendingId, setPendingId] = useState<string | null>(null);

  const orderedEpisodeIds = seasons
    .slice()
    .sort((a, b) => a.seasonNumber - b.seasonNumber)
    .flatMap((s) => s.episodes.slice().sort((a, b) => a.episodeNumber - b.episodeNumber).map((e) => e.id));

  async function toggleWatched(episodeId: string, nextWatched: boolean) {
    setPendingId(episodeId);
    setWatchedIds((prev) => {
      const next = new Set(prev);
      if (nextWatched) next.add(episodeId);
      else next.delete(episodeId);
      return next;
    });

    await fetch(`/api/episodes/${episodeId}/watch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ watched: nextWatched }),
    });
    setPendingId(null);
  }

  async function markAllPrevious(episodeId: string) {
    setPendingId(episodeId);
    const cutoffIndex = orderedEpisodeIds.indexOf(episodeId);
    setWatchedIds((prev) => {
      const next = new Set(prev);
      for (const id of orderedEpisodeIds.slice(0, cutoffIndex + 1)) next.add(id);
      return next;
    });

    await fetch(`/api/shows/${showId}/mark-previous`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ throughEpisodeId: episodeId }),
    });
    setPendingId(null);
  }

  return (
    <div className="flex flex-col gap-3">
      {seasons
        .slice()
        .sort((a, b) => a.seasonNumber - b.seasonNumber)
        .map((season) => {
          const watchedInSeason = season.episodes.filter((e) => watchedIds.has(e.id)).length;
          return (
            <details key={season.id} className="rounded-lg bg-bg-surface" open={season.seasonNumber === 1}>
              <summary className="cursor-pointer list-none px-4 py-3 font-medium">
                <span className="flex items-center justify-between">
                  <span>
                    {season.seasonNumber === 0 ? "Specials" : `Season ${season.seasonNumber}`}
                  </span>
                  <span className="text-sm font-normal text-text-secondary">
                    {watchedInSeason}/{season.episodes.length}
                  </span>
                </span>
              </summary>
              <div className="flex flex-col divide-y divide-bg-surface-hover border-t border-bg-surface-hover">
                {season.episodes
                  .slice()
                  .sort((a, b) => a.episodeNumber - b.episodeNumber)
                  .map((ep) => {
                    const watched = watchedIds.has(ep.id);
                    return (
                      <div key={ep.id} className="flex items-center gap-3 px-4 py-2.5">
                        <input
                          type="checkbox"
                          checked={watched}
                          disabled={pendingId === ep.id}
                          onChange={(e) => toggleWatched(ep.id, e.target.checked)}
                          className="h-4 w-4 shrink-0 accent-[var(--neon-primary)]"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm">
                            <span className="text-text-secondary">{ep.episodeNumber}.</span> {ep.title}
                          </p>
                          <p className="text-xs text-text-secondary">{formatAirDate(ep.airDate)}</p>
                        </div>
                        {!watched && (
                          <button
                            onClick={() => markAllPrevious(ep.id)}
                            disabled={pendingId === ep.id}
                            className="shrink-0 whitespace-nowrap text-xs text-neon-cyan hover:underline disabled:opacity-60"
                          >
                            Mark previous watched
                          </button>
                        )}
                      </div>
                    );
                  })}
              </div>
            </details>
          );
        })}
    </div>
  );
}
