import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { searchTvShows, tmdbImageUrl } from "@/lib/tmdb";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const query = new URL(request.url).searchParams.get("q")?.trim();
  if (!query) {
    return NextResponse.json({ results: [] });
  }

  const results = await searchTvShows(query);
  return NextResponse.json({
    results: results.slice(0, 20).map((r) => ({
      tmdbId: r.id,
      title: r.name,
      overview: r.overview,
      posterUrl: tmdbImageUrl(r.poster_path, "w200"),
      firstAirDate: r.first_air_date,
    })),
  });
}
