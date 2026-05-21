import type { SupabaseClient, User } from "@supabase/supabase-js";

export const INITIAL_IMAGE_CREDITS = Number.parseInt(
  process.env.INITIAL_IMAGE_CREDITS ?? "25",
  10
);

type EnsureUserProfileOptions = {
  grantInitialCredits?: boolean;
};

export async function ensureUserProfile(
  supabase: SupabaseClient,
  user: User,
  options: EnsureUserProfileOptions = {}
): Promise<{ credits: number | null }> {
  const startingCredits = Number.isFinite(INITIAL_IMAGE_CREDITS)
    ? INITIAL_IMAGE_CREDITS
    : 25;

  const { data: existing } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", user.id)
    .maybeSingle();

  if (!existing) {
    await supabase.from("profiles").insert({
      id: user.id,
      email: user.email ?? null,
      credits: startingCredits,
    });
  } else {
    const credits =
      typeof existing.credits === "number" ? existing.credits : null;
    const shouldGrantInitialCredits =
      options.grantInitialCredits && (credits === null || credits <= 0);
    const shouldBackfillMissingCredits = credits === null;

    if (shouldGrantInitialCredits || shouldBackfillMissingCredits) {
      await supabase
        .from("profiles")
        .update({ credits: startingCredits })
        .eq("id", user.id);
    }
  }

  if (user.email) {
    await supabase
      .from("profiles")
      .update({ email: user.email })
      .eq("id", user.id);
  }

  const { data } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", user.id)
    .maybeSingle();

  return { credits: typeof data?.credits === "number" ? data.credits : null };
}
