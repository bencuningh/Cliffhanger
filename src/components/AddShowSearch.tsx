"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface SearchResult {
  tmdbId: number;
  title: string;
  overview: string;
  posterUrl: string | null;
  firstAirDate: string | null;
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

export function AddShowSearch() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query.trim(), 350);
  const router = useRouter();

  const { data, isFetching } = useQuery({
    queryKey: ["show-search", debouncedQuery],
    queryFn: async (): Promise<SearchResult[]> => {
      const res = await fetch(`/api/shows/search?q=${encodeURIComponent(debouncedQuery)}`);
      if (!res.ok) throw new Error("Search failed");
      const json = await res.json();
      return json.results;
    },
    enabled: debouncedQuery.length > 1,
  });

  const addShow = useMutation({
    mutationFn: async (tmdbId: number) => {
      const res = await fetch("/api/shows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tmdbId, status: "PLAN_TO_WATCH" }),
      });
      if (!res.ok) throw new Error("Failed to add show");
      return res.json();
    },
    onSuccess: () => {
      setQuery("");
      router.refresh();
    },
  });

  return (
    <div className="relative">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a show to add..."
        className="w-full rounded border border-neon-dark/40 bg-bg-surface px-4 py-2 text-text-primary outline-none focus:border-neon-primary"
      />
      {debouncedQuery.length > 1 && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg bg-bg-surface shadow-xl">
          {isFetching && (
            <p className="px-4 py-3 text-sm text-text-secondary">Searching...</p>
          )}
          {!isFetching && data?.length === 0 && (
            <p className="px-4 py-3 text-sm text-text-secondary">No shows found.</p>
          )}
          {data?.map((result) => (
            <div
              key={result.tmdbId}
              className="flex items-center gap-3 border-b border-bg-surface-hover px-3 py-2 last:border-b-0 hover:bg-bg-surface-hover"
            >
              <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded bg-bg-surface-hover">
                {result.posterUrl && (
                  <Image src={result.posterUrl} alt={result.title} fill sizes="40px" className="object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{result.title}</p>
                <p className="text-xs text-text-secondary">
                  {result.firstAirDate?.slice(0, 4) ?? "TBA"}
                </p>
              </div>
              <button
                onClick={() => addShow.mutate(result.tmdbId)}
                disabled={addShow.isPending}
                className="neon-button shrink-0 rounded px-3 py-1 text-xs disabled:opacity-60"
              >
                Add
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
