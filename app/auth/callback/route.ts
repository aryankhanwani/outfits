import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ensureUserProfile } from "@/lib/profile";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function getSafeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/studio";
  }

  return value;
}

function isRecentAuthTimestamp(value?: string) {
  if (!value) return false;

  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return false;

  return Math.abs(Date.now() - timestamp) < 10 * 60 * 1000;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = getSafeNext(searchParams.get("next"));
  const shouldGrantInitialCredits =
    searchParams.get("initial_credits") === "1";

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const cookieStore = await cookies();
  const response = NextResponse.redirect(`${origin}${next}`);
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("redirect", next);
    loginUrl.searchParams.set("error", "auth_callback_failed");
    return NextResponse.redirect(loginUrl);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const admin = createSupabaseAdminClient();
    const isNewOrJustConfirmed =
      isRecentAuthTimestamp(user.created_at) ||
      isRecentAuthTimestamp(user.email_confirmed_at) ||
      isRecentAuthTimestamp(user.confirmed_at);

    await ensureUserProfile(admin, user, {
      grantInitialCredits:
        shouldGrantInitialCredits && isNewOrJustConfirmed,
    });
  }

  return response;
}
