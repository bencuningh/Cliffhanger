/**
 * Minimal typed client for the parts of the TMDb v3 API this app uses:
 * searching TV shows, and reading a show's details/season/episode data.
 * https://developer.themoviedb.org/reference/intro/getting-started
 */

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export class TmdbError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "TmdbError";
  }
}

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    throw new Error("TMDB_API_KEY is not set");
  }

  const url = new URL(`${TMDB_BASE_URL}${path}`);
  url.searchParams.set("api_key", apiKey);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url, { next: { revalidate: 60 * 60 } });
  if (!res.ok) {
    throw new TmdbError(`TMDb request failed: ${path} (${res.status})`, res.status);
  }
  return res.json() as Promise<T>;
}

export function tmdbImageUrl(path: string | null, size: "w200" | "w300" | "w500" | "original" = "w500") {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

export interface TmdbSearchResultItem {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  first_air_date: string | null;
}

interface TmdbSearchResponse {
  results: TmdbSearchResultItem[];
}

export async function searchTvShows(query: string): Promise<TmdbSearchResultItem[]> {
  const data = await tmdbFetch<TmdbSearchResponse>("/search/tv", { query });
  return data.results;
}

export interface TmdbSeasonSummary {
  id: number;
  season_number: number;
  episode_count: number;
  poster_path: string | null;
}

export interface TmdbShowDetails {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  status: string; // "Returning Series" | "Ended" | "Canceled" | "In Production" | "Planned"
  first_air_date: string | null;
  episode_run_time: number[];
  seasons: TmdbSeasonSummary[];
}

export async function getTvShowDetails(tmdbId: number): Promise<TmdbShowDetails> {
  return tmdbFetch<TmdbShowDetails>(`/tv/${tmdbId}`);
}

export interface TmdbEpisode {
  id: number;
  episode_number: number;
  name: string;
  overview: string;
  air_date: string | null;
  runtime: number | null;
}

export interface TmdbSeasonDetails {
  id: number;
  season_number: number;
  episodes: TmdbEpisode[];
}

export async function getSeasonDetails(
  tmdbId: number,
  seasonNumber: number,
): Promise<TmdbSeasonDetails> {
  return tmdbFetch<TmdbSeasonDetails>(`/tv/${tmdbId}/season/${seasonNumber}`);
}
