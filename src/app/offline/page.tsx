export const dynamic = "force-static";

export default function OfflinePage() {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-3 pt-24 text-center">
      <h1 className="neon-text text-2xl font-bold">You&apos;re offline</h1>
      <p className="text-text-secondary">
        This page hasn&apos;t been loaded yet, so there&apos;s nothing cached for it. Pages you&apos;ve
        already visited will keep working without a connection.
      </p>
    </div>
  );
}
