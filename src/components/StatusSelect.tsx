"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { UserShowStatus } from "@prisma/client";
import { STATUS_LABELS, STATUS_ORDER } from "@/lib/my-shows";

export function StatusSelect({
  userShowId,
  initialStatus,
}: {
  userShowId: string;
  initialStatus: UserShowStatus;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleChange(next: UserShowStatus) {
    setStatus(next);
    setSaving(true);
    await fetch(`/api/shows/${userShowId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <select
      value={status}
      disabled={saving}
      onChange={(e) => handleChange(e.target.value as UserShowStatus)}
      className="rounded border border-neon-dark/40 bg-bg-surface px-3 py-1.5 text-sm text-text-primary outline-none focus:border-neon-primary disabled:opacity-60"
    >
      {STATUS_ORDER.map((s) => (
        <option key={s} value={s}>
          {STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}
