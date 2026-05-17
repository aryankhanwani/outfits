/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { BuyCredits } from "@/components/BuyCredits";
import { ensureUserProfile } from "@/lib/profile";

export default async function AccountPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) await ensureUserProfile(supabase, user);

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("email, credits, created_at")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null as any };

  const { data: purchases } = user
    ? await supabase
        .from("purchases")
        .select("created_at, plan_id, interval, status, credits_granted")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)
    : { data: [] as any[] };

  return (
    <div className="min-h-screen bg-[#07070f] text-[#f8f4ec]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(27,206,168,0.16),transparent_34%),radial-gradient(circle_at_88%_0%,rgba(124,58,237,0.18),transparent_32%)]" />
      <div className="relative mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1bcea8]">Account</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-white sm:text-5xl">Your workspace</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#b9b6c8]">Manage credits, billing history, and access to the studio.</p>
          </div>
          <a href="/studio" className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#1bcea8] px-6 text-sm font-semibold text-[#07070f] shadow-lg shadow-[#1bcea8]/25 transition hover:bg-[#22efc2]">Open studio</a>
        </header>

        {!user ? (
          <section className="rounded-[30px] border border-white/[0.08] bg-white/[0.05] p-8 text-center shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-white">Sign in to view your account</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#b9b6c8]">Your credits and purchases are saved to your workspace.</p>
            <a href="/login" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-white px-7 text-sm font-semibold text-[#07070f] transition hover:bg-[#f2ede4]">Log in</a>
          </section>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
            <section className="rounded-[30px] border border-white/[0.08] bg-white/[0.05] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <div className="rounded-3xl bg-[#0b0b17] p-5 ring-1 ring-white/[0.08]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b8ba0]">Image credits</p>
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-6xl font-semibold tracking-[-0.08em] text-white">{typeof profile?.credits === "number" ? profile.credits : "—"}</span>
                  <span className="pb-2 text-sm text-[#8b8ba0]">remaining</span>
                </div>
                <div className="mt-5"><BuyCredits /></div>
              </div>

              <div className="mt-5 space-y-3 rounded-3xl border border-white/[0.08] bg-white/[0.03] p-5 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#8b8ba0]">Email</span>
                  <span className="max-w-[220px] truncate font-semibold text-white">{user.email ?? profile?.email ?? "—"}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#8b8ba0]">Joined</span>
                  <span className="font-semibold text-white">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}</span>
                </div>
              </div>

              <form action="/api/auth/logout" method="post" className="mt-5">
                <button type="submit" className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.05] px-5 text-sm font-semibold text-white transition hover:bg-white/[0.1]">Log out</button>
              </form>
            </section>

            <section className="rounded-[30px] border border-white/[0.08] bg-white/[0.05] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold tracking-[-0.04em] text-white">Purchase history</h2>
                  <p className="mt-1 text-sm text-[#8b8ba0]">Recent credit top-ups and plans.</p>
                </div>
                <a href="/pricing" className="rounded-full border border-white/[0.1] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.08]">View plans</a>
              </div>

              {purchases && purchases.length > 0 ? (
                <div className="overflow-hidden rounded-3xl border border-white/[0.08]">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.14em] text-[#8b8ba0]">
                      <tr><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Credits</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Status</th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.08]">
                      {purchases.map((p: any, idx: number) => (
                        <tr key={`${p.created_at}-${idx}`} className="text-[#f8f4ec]">
                          <td className="px-4 py-4 font-semibold capitalize">{p.plan_id} <span className="font-normal text-[#8b8ba0]">/{p.interval}</span></td>
                          <td className="px-4 py-4">{p.credits_granted}</td>
                          <td className="px-4 py-4 text-[#b9b6c8]">{p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}</td>
                          <td className="px-4 py-4"><span className="rounded-full bg-[#1bcea8]/10 px-2.5 py-1 text-xs font-semibold text-[#1bcea8]">{p.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-white/[0.12] bg-[#0b0b17] p-10 text-center">
                  <p className="text-sm font-semibold text-white">No purchases yet</p>
                  <p className="mt-1 text-sm text-[#8b8ba0]">Your top-ups will appear here.</p>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
