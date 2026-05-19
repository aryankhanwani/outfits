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
        </div>
        <nav className="flex min-w-0 items-center gap-1.5 overflow-x-auto pb-1 sm:gap-2 sm:overflow-visible sm:pb-0">
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
