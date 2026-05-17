import { NextResponse } from "next/server";
import crypto from "crypto";
import { PLANS, type BillingInterval, type PlanId } from "@/lib/plans";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type Body = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  planId: PlanId;
  interval: BillingInterval;
};

function isPlanId(v: unknown): v is PlanId {
  return v === "starter" || v === "creator" || v === "studio";
}
function isInterval(v: unknown): v is BillingInterval {
  return v === "monthly" || v === "annual";
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as Body | null;
  if (
    !body ||
    !body.razorpay_order_id ||
    !body.razorpay_payment_id ||
    !body.razorpay_signature ||
    !isPlanId(body.planId) ||
    !isInterval(body.interval)
  ) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return NextResponse.json(
      { error: "Razorpay is not configured" },
      { status: 500 }
    );
  }

  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${body.razorpay_order_id}|${body.razorpay_payment_id}`)
    .digest("hex");

  if (
    !crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(body.razorpay_signature)
    )
  ) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const plan = PLANS.find((p) => p.id === body.planId);
  if (!plan) {
    return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  }

  const creditsGranted =
    body.interval === "annual" ? plan.creditsPerMonth * 12 : plan.creditsPerMonth;

  const admin = createSupabaseAdminClient();

  // Ensure profile exists (trigger should do it, but keep safe).
  await admin.from("profiles").upsert({ id: user.id, email: user.email ?? null });

  // Add credits atomically via RPC-style SQL is ideal; we do read+update for now.
  const { data: prof, error: profErr } = await admin
    .from("profiles")
    .select("credits")
    .eq("id", user.id)
    .single();
  if (profErr) {
    return NextResponse.json({ error: profErr.message }, { status: 500 });
  }

  const nextCredits = (prof.credits as number) + creditsGranted;
  const { error: updErr } = await admin
    .from("profiles")
    .update({ credits: nextCredits })
    .eq("id", user.id);
  if (updErr) {
    return NextResponse.json({ error: updErr.message }, { status: 500 });
  }

  // Record purchase (best-effort).
  await admin.from("purchases").insert({
    user_id: user.id,
    plan_id: body.planId,
    interval: body.interval,
    razorpay_order_id: body.razorpay_order_id,
    razorpay_payment_id: body.razorpay_payment_id,
    razorpay_signature: body.razorpay_signature,
    status: "paid",
    credits_granted: creditsGranted,
    amount_inr: 0,
    currency: "INR",
  });

  return NextResponse.json({ ok: true, credits: nextCredits });
}

