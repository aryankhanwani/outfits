import type { SupabaseClient, User } from "@supabase/supabase-js";

export const INITIAL_IMAGE_CREDITS = Number.parseInt(
  process.env.INITIAL_IMAGE_CREDITS ?? "25",
  10
);

export async function ensureUserProfile(
  supabase: SupabaseClient,
  user: User
): Promise<{ credits: number | null }> {
  const startingCredits = Number.isFinite(INITIAL_IMAGE_CREDITS)
    ? INITIAL_IMAGE_CREDITS
    : 25;

  await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email ?? null,
      credits: startingCredits,
    },
    { onConflict: "id", ignoreDuplicates: true }
  );

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
