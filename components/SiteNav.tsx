import { ensureUserProfile } from "@/lib/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";

export async function SiteNav() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profile = user ? await ensureUserProfile(supabase, user) : null;

  return (
    <div className="sticky top-0 z-40 border-b border-zinc-200/60 bg-white/80 backdrop-blur-xl dark:border-zinc-800/60 dark:bg-zinc-950/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <Link
            href={user ? "/studio" : "/"}
            className="inline-flex min-h-10 items-center rounded-full text-base font-semibold tracking-tight text-zinc-900 dark:text-white"
          >
            OutfitAI
          </Link>
          {user && (
            <span className="inline-flex shrink-0 rounded-full border border-zinc-200 bg-white/75 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-200 sm:hidden">
              {profile?.credits ?? 0} credits
            </span>
          )}
          <details className="group relative sm:hidden">
            <summary className="flex min-h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full border border-zinc-200 bg-white/75 text-zinc-800 shadow-sm transition hover:bg-white dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-100 dark:hover:bg-zinc-950 [&::-webkit-details-marker]:hidden">
              <span className="sr-only">Open navigation menu</span>
              <span className="relative block h-4 w-5">
                <span className="absolute left-0 top-0 h-0.5 w-5 rounded-full bg-current transition group-open:top-1.5 group-open:rotate-45" />
                <span className="absolute left-0 top-1.5 h-0.5 w-5 rounded-full bg-current transition group-open:opacity-0" />
                <span className="absolute left-0 top-3 h-0.5 w-5 rounded-full bg-current transition group-open:top-1.5 group-open:-rotate-45" />
              </span>
            </summary>
            <div className="absolute right-0 top-12 z-50 w-56 rounded-3xl border border-zinc-200 bg-white/95 p-2 shadow-2xl shadow-zinc-950/10 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/95">
              <Link href="/pricing" className="block rounded-2xl px-4 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-white/[0.06]">
                Pricing
              </Link>
              <Link href="/studio" className="block rounded-2xl px-4 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-white/[0.06]">
                Studio
              </Link>
              {user && (
                <Link href="/account" className="block rounded-2xl px-4 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-white/[0.06]">
                  Profile
                </Link>
              )}
              {user && (
                <Link href="/pricing" className="mt-1 flex min-h-11 items-center justify-center rounded-2xl bg-violet-600 px-4 text-sm font-semibold text-white shadow-sm shadow-violet-600/25 transition hover:bg-violet-500">
                  Buy more
                </Link>
              )}
              {user ? (
                <form action="/api/auth/logout" method="post" className="mt-2">
                  <button
                    type="submit"
                    className="flex min-h-11 w-full items-center justify-center rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-100 dark:hover:bg-white/[0.06]"
                  >
                    Log out
                  </button>
                </form>
              ) : (
                <Link href="/login" className="mt-1 flex min-h-11 items-center justify-center rounded-2xl bg-violet-600 px-4 text-sm font-semibold text-white shadow-sm shadow-violet-600/25 transition hover:bg-violet-500">
                  Log in
                </Link>
              )}
            </div>
          </details>
        </div>
        <nav className="hidden min-w-0 items-center gap-2 sm:flex">
          <Link
            href="/pricing"
            className="inline-flex min-h-9 shrink-0 items-center rounded-full px-3 py-1.5 text-sm font-semibold text-zinc-700 hover:text-zinc-900 dark:text-zinc-200 dark:hover:text-white"
          >
            Pricing
          </Link>
          <Link
            href="/studio"
            className="inline-flex min-h-9 shrink-0 items-center rounded-full px-3 py-1.5 text-sm font-semibold text-zinc-700 hover:text-zinc-900 dark:text-zinc-200 dark:hover:text-white"
          >
            Studio
          </Link>
          {user && (
            <Link
              href="/account"
              className="inline-flex min-h-9 shrink-0 items-center rounded-full px-3 py-1.5 text-sm font-semibold text-zinc-700 hover:text-zinc-900 dark:text-zinc-200 dark:hover:text-white"
            >
              Profile
            </Link>
          )}
          {user && (
            <span className="hidden rounded-full border border-zinc-200 bg-white/70 px-3 py-1.5 text-sm font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-200 sm:inline-flex">
              {profile?.credits ?? 0} credits
            </span>
          )}
          {user && (
            <Link
              href="/pricing"
              className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-full bg-violet-600 px-4 text-sm font-semibold text-white shadow-sm shadow-violet-600/25 transition hover:bg-violet-500"
            >
              Buy more
            </Link>
          )}
          {user ? (
            <form action="/api/auth/logout" method="post" className="shrink-0">
              <button
                type="submit"
                className="inline-flex min-h-9 items-center justify-center rounded-full border border-zinc-200 bg-white/70 px-4 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-white dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-100 dark:hover:bg-zinc-950"
              >
                Log out
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-full bg-violet-600 px-4 text-sm font-semibold text-white shadow-sm shadow-violet-600/25 transition hover:bg-violet-500"
            >
              Log in
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
}
