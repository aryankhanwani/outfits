/* eslint-disable @next/next/no-html-link-for-pages */
import { ensureUserProfile } from "@/lib/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function SiteNav() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profile = user ? await ensureUserProfile(supabase, user) : null;

  return (
    <div className="sticky top-0 z-40 border-b border-zinc-200/60 bg-white/50 backdrop-blur dark:border-zinc-800/60 dark:bg-zinc-950/30">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <a
          href={user ? "/studio" : "/"}
          className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white"
        >
          OutfitAI
        </a>
        <nav className="flex items-center gap-2">
          <a
            href="/pricing"
            className="rounded-full px-3 py-1.5 text-sm font-semibold text-zinc-700 hover:text-zinc-900 dark:text-zinc-200 dark:hover:text-white"
          >
            Pricing
          </a>
          <a
            href="/studio"
            className="rounded-full px-3 py-1.5 text-sm font-semibold text-zinc-700 hover:text-zinc-900 dark:text-zinc-200 dark:hover:text-white"
          >
            Studio
          </a>
          {user && (
            <a
              href="/account"
              className="rounded-full px-3 py-1.5 text-sm font-semibold text-zinc-700 hover:text-zinc-900 dark:text-zinc-200 dark:hover:text-white"
            >
              Profile
            </a>
          )}
          {user && (
            <span className="hidden rounded-full border border-zinc-200 bg-white/70 px-3 py-1.5 text-sm font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-200 sm:inline-flex">
              {profile?.credits ?? 0} credits
            </span>
          )}
          {user && (
            <a
              href="/pricing"
              className="inline-flex min-h-9 items-center justify-center rounded-full bg-violet-600 px-4 text-sm font-semibold text-white shadow-sm shadow-violet-600/25 transition hover:bg-violet-500"
            >
              Buy more
            </a>
          )}
          {user ? (
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="inline-flex min-h-9 items-center justify-center rounded-full border border-zinc-200 bg-white/70 px-4 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-white dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-100 dark:hover:bg-zinc-950"
              >
                Log out
              </button>
            </form>
          ) : (
            <a
              href="/login"
              className="inline-flex min-h-9 items-center justify-center rounded-full bg-violet-600 px-4 text-sm font-semibold text-white shadow-sm shadow-violet-600/25 transition hover:bg-violet-500"
            >
              Log in
            </a>
          )}
        </nav>
      </div>
    </div>
  );
}
