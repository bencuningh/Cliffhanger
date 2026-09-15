export function ProgressBar({ watched, total }: { watched: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((watched / total) * 100)) : 0;

  return (
    <div className="flex flex-col gap-1">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-surface-hover">
        <div
          className="h-full rounded-full bg-neon-primary transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-text-secondary">
        {watched}/{total} episodes
      </span>
    </div>
  );
}
