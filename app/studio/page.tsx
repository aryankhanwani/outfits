/* eslint-disable @next/next/no-html-link-for-pages */
import { TryOnStudio } from "@/components/TryOnStudio";
import { ensureUserProfile, INITIAL_IMAGE_CREDITS } from "@/lib/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function MiniIcon({ type }: { type: "logo" | "credits" | "studio" | "account" | "pricing" }) {
  const paths = {
    logo: "M12 2l2.1 6.2L20 10l-5.9 2L12 18l-2.1-6L4 10l5.9-1.8L12 2Z",
    credits: "M12 7c4.4 0 8-1.3 8-3s-3.6-3-8-3-8 1.3-8 3 3.6 3 8 3Zm8-3v5c0 1.7-3.6 3-8 3s-8-1.3-8-3V4m16 5v5c0 1.7-3.6 3-8 3s-8-1.3-8-3V9",
    studio: "M4 5h16v14H4V5Zm3 10 3-3 2 2 3-3 5 5M8 9h.01",
    account: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8 9a8 8 0 0 0-16 0",
    pricing: "M20 12V7a2 2 0 0 0-2-2h-5L5 13l6 6 9-7Z",
  } as const;
  const stroke = type !== "logo";
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill={stroke ? "none" : "currentColor"} aria-hidden="true">
      <path d={paths[type]} stroke={stroke ? "currentColor" : undefined} strokeWidth={stroke ? 1.8 : undefined} strokeLinecap={stroke ? "round" : undefined} strokeLinejoin={stroke ? "round" : undefined} />
    </svg>
  );
}

export default async function StudioPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = user ? await ensureUserProfile(supabase, user) : { credits: null };
  const credits = profile.credits;

  return (
    <main className="min-h-screen overflow-hidden bg-[#05070d] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_4%,rgba(109,240,208,0.14),transparent_34%),radial-gradient(circle_at_86%_0%,rgba(130,87,255,0.19),transparent_34%),linear-gradient(180deg,#05070d_0%,#070a13_45%,#05070d_100%)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:72px_72px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1500px] flex-col px-4 py-6 sm:px-6 lg:px-8">
        {!user ? (
          <section className="grid flex-1 place-items-center py-10">
            <div className="mx-auto max-w-xl rounded-[36px] border border-white/[0.08] bg-white/[0.055] p-8 text-center shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-10">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-[28px] bg-[#6df0d0] text-[#05070d] shadow-[0_18px_55px_rgba(109,240,208,0.22)]">
                <MiniIcon type="studio" />
              </div>
              <h1 className="mt-6 text-3xl font-semibold tracking-[-0.06em] sm:text-5xl">Create your studio workspace</h1>
              <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/52">Sign up to start generating outfit previews. New accounts include {INITIAL_IMAGE_CREDITS} free image credits.</p>
              <a href="/login" className="mt-7 inline-flex min-h-13 items-center justify-center rounded-2xl bg-[#6df0d0] px-7 text-sm font-extrabold text-[#05070d] shadow-[0_18px_55px_rgba(109,240,208,0.22)] transition hover:-translate-y-0.5 hover:bg-[#8cf8dd]">Get started free</a>
            </div>
          </section>
        ) : (
          <section className="pb-8">
            <TryOnStudio initialCredits={credits ?? 0} />
          </section>
        )}
      </div>
    </main>
  );
}
