"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const links = [
  { href: "/dashboard", label: "My Shows" },
  { href: "/up-next", label: "Up Next" },
  { href: "/stats", label: "Stats" },
];

export function NavBar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  if (status !== "authenticated") {
    return null;
  }

  return (
    <header className="sticky top-0 z-10 border-b border-neon-dark/40 bg-bg-primary/90 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="neon-text text-lg font-bold tracking-wide">
          Cliffhanger
        </Link>
        <div className="flex items-center gap-1 sm:gap-4">
          {links.map((link) => {
            const active = pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  active
                    ? "neon-text rounded px-2 py-1 text-sm font-medium sm:px-3"
                    : "rounded px-2 py-1 text-sm text-text-secondary transition-colors hover:text-text-primary sm:px-3"
                }
              >
                {link.label}
              </Link>
            );
          })}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="neon-button rounded px-3 py-1 text-sm"
          >
            {session?.user?.name ? `Sign out (${session.user.name})` : "Sign out"}
          </button>
        </div>
      </nav>
    </header>
  );
}
