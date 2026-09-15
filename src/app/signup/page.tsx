"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (result?.error) {
      setError("Account created, but sign-in failed. Try logging in.");
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
          <label htmlFor="name" className="text-sm text-text-secondary">
            Name (optional)
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded border border-neon-dark/40 bg-bg-primary px-3 py-2 text-text-primary outline-none focus:border-neon-primary"
          />
        </div>
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
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded border border-neon-dark/40 bg-bg-primary px-3 py-2 text-text-primary outline-none focus:border-neon-primary"
          />
          <span className="text-xs text-text-secondary">At least 8 characters.</span>
        </div>
        {error && <p className="text-sm text-neon-pink">{error}</p>}
        <button type="submit" disabled={loading} className="neon-button-primary rounded py-2 font-medium disabled:opacity-60">
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p className="text-center text-sm text-text-secondary">
        Already have an account?{" "}
        <Link href="/login" className="text-neon-cyan hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
