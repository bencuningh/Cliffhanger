"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 pt-16">
      <h1 className="neon-text text-center text-3xl font-bold">Cliffhanger</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-lg bg-bg-surface p-6">
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm text-text-secondary">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded border border-neon-dark/40 bg-bg-primary px-3 py-2 text-text-primary outline-none focus:border-neon-primary"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm text-text-secondary">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded border border-neon-dark/40 bg-bg-primary px-3 py-2 text-text-primary outline-none focus:border-neon-primary"
          />
        </div>
        {error && <p className="text-sm text-neon-pink">{error}</p>}
        <button type="submit" disabled={loading} className="neon-button-primary rounded py-2 font-medium disabled:opacity-60">
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="text-center text-sm text-text-secondary">
        No account yet?{" "}
        <Link href="/signup" className="text-neon-cyan hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
