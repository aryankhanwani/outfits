"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function LoginInner() {
  const search = useSearchParams();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "busy">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const busy = status === "busy";

  const authRedirectTo = (grantInitialCredits = false): string | undefined => {
    const next = search.get("redirect") || "/studio";
    const initialCreditsParam = grantInitialCredits ? "&initial_credits=1" : "";
    if (typeof window !== "undefined") {
      return `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}${initialCreditsParam}`;
    }
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (siteUrl) return `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}${initialCreditsParam}`;
    return undefined;
  };

  const onGoogle = async () => {
    setMessage(null);
    setStatus("busy");
    const supabase = createSupabaseBrowserClient();
    const redirectTo = authRedirectTo(mode === "signup");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: redirectTo ? { redirectTo } : undefined,
    });
    if (error) setMessage(error.message);
    setStatus("idle");
  };

  const onEmail = async () => {
    setMessage(null);
    setStatus("busy");
    const supabase = createSupabaseBrowserClient();
    try {
      if (!email.trim() || !password) {
        throw new Error("Enter email and password.");
      }

      if (mode === "signup") {
        const emailRedirectTo = authRedirectTo(true);
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: emailRedirectTo ? { emailRedirectTo } : undefined,
        });
        if (error) throw error;
        setMessage("Check your email to confirm your account, then come back.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        router.push(search.get("redirect") || "/studio");
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="min-h-screen bg-[#07070f] text-[#f8f4ec]">
      <div className="mx-auto flex w-full max-w-xl flex-col px-4 pb-24 pt-14 sm:px-6">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 self-center text-sm font-semibold text-[#b9b6c8] hover:text-white"
        >
          <span className="text-lg">←</span> Back to home
        </Link>

        <div className="rounded-[30px] border border-white/[0.08] bg-white/[0.05] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-10">
          <h1 className="text-balance text-3xl font-semibold tracking-[-0.06em] text-white">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#b9b6c8]">
            Create your workspace, get free image credits, and start generating polished outfit visuals.
          </p>

          <div className="mt-6 grid gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => void onGoogle()}
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/[0.1] bg-white/[0.06] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Continue with Google
            </button>

            <div className="my-2 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/[0.1]" />
              <span className="text-xs text-[#8b8ba0]">or</span>
              <div className="h-px flex-1 bg-white/[0.1]" />
            </div>

            <div className="flex rounded-2xl border border-white/[0.1] bg-[#0b0b17] p-1">
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  mode === "signup"
                    ? "bg-[#1bcea8] text-[#07070f]"
                    : "text-[#b9b6c8] hover:text-white"
                }`}
              >
                Sign up
              </button>
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  mode === "login"
                    ? "bg-[#1bcea8] text-[#07070f]"
                    : "text-[#b9b6c8] hover:text-white"
                }`}
              >
                Log in
              </button>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-[#f8f4ec]">
                Email
              </span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={busy}
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="min-h-12 rounded-2xl border border-white/[0.1] bg-[#0b0b17] px-4 text-sm text-white placeholder:text-[#555570] focus:border-[#1bcea8] focus:outline-none focus:ring-2 focus:ring-[#1bcea8]/20 disabled:opacity-60"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-[#f8f4ec]">
                Password
              </span>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={busy}
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                placeholder="••••••••"
                className="min-h-12 rounded-2xl border border-white/[0.1] bg-[#0b0b17] px-4 text-sm text-white placeholder:text-[#555570] focus:border-[#1bcea8] focus:outline-none focus:ring-2 focus:ring-[#1bcea8]/20 disabled:opacity-60"
              />
            </label>

            <button
              type="button"
              disabled={busy}
              onClick={() => void onEmail()}
              className="mt-2 inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#1bcea8] px-4 text-sm font-semibold text-[#07070f] shadow-lg shadow-[#1bcea8]/25 transition hover:bg-[#22efc2] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy
                ? "Please wait…"
                : mode === "signup"
                  ? "Create account"
                  : "Log in"}
            </button>

            {message && (
              <div className="mt-2 rounded-2xl border border-white/[0.1] bg-white/[0.06] px-4 py-3 text-sm text-[#f8f4ec]">
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}
