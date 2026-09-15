export interface EpisodeForProgress {
  id: string;
  airDate: Date | null;
}

export interface ShowProgress {
  watchedCount: number;
  airedCount: number;
  totalCount: number;
}

/** Progress is measured against aired episodes — unaired ones aren't "behind" yet. */
export function computeProgress(
  episodes: EpisodeForProgress[],
  watchedEpisodeIds: Set<string>,
): ShowProgress {
  const now = new Date();
  let airedCount = 0;
  let watchedCount = 0;

  for (const ep of episodes) {
    const aired = ep.airDate !== null && ep.airDate <= now;
    if (aired) airedCount += 1;
    if (watchedEpisodeIds.has(ep.id)) watchedCount += 1;
  }

  return { watchedCount, airedCount, totalCount: episodes.length };
}
