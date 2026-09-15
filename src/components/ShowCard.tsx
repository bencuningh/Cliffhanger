import Link from "next/link";
import Image from "next/image";
import { ProgressBar } from "@/components/ProgressBar";

export function ShowCard({
  showId,
  title,
  posterUrl,
  watched,
  total,
}: {
  showId: string;
  title: string;
  posterUrl: string | null;
  watched: number;
  total: number;
}) {
  return (
    <Link
      href={`/shows/${showId}`}
      className="group flex flex-col gap-2 rounded-lg bg-bg-surface p-2 transition-colors hover:bg-bg-surface-hover"
    >
      <div className="relative aspect-2/3 w-full overflow-hidden rounded bg-bg-surface-hover">
        {posterUrl ? (
          <Image src={posterUrl} alt={title} fill sizes="200px" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center p-2 text-center text-xs text-text-secondary">
            {title}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <span className="line-clamp-2 text-sm font-medium text-text-primary group-hover:text-neon-light">
          {title}
        </span>
        <ProgressBar watched={watched} total={total} />
      </div>
    </Link>
  );
}
