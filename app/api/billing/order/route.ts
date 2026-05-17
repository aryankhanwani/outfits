/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { PLANS, type BillingInterval, type PlanId, priceFor } from "@/lib/plans";
import { usdToInrPaise } from "@/lib/money";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type Body = { planId: PlanId; interval: BillingInterval };

function isPlanId(v: unknown): v is PlanId {
  return v === "starter" || v === "creator" || v === "studio";
}
function isInterval(v: unknown): v is BillingInterval {
  return v === "monthly" || v === "annual";
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = (await request.json().catch(() => null)) as Body | null;
    if (!json || !isPlanId(json.planId) || !isInterval(json.interval)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const plan = PLANS.find((p) => p.id === json.planId);
    if (!plan) {
      return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
    }

    const usd = priceFor(plan, json.interval);
    const amount = usdToInrPaise(usd); // Razorpay expects paise

    const keyId =
      process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return NextResponse.json(
        {
          error: "Razorpay is not configured",
          detail:
            "Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your server env.",
        },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    // Razorpay receipt has a tight length limit; keep it short.
    const receipt = `u_${user.id.slice(0, 8)}_${json.planId}_${json.interval}_${Date.now()}`;

    let order: { id: string; amount: number; currency: string };
    try {
      order = (await razorpay.orders.create({
        amount,
        currency: "INR",
        receipt,
        notes: {
          user_id: user.id,
          plan_id: json.planId,
          interval: json.interval,
        },
      })) as any;
    } catch (e) {
      const anyErr = e as any;
      const msg =
        anyErr?.error?.description ||
        anyErr?.error?.message ||
        anyErr?.description ||
        anyErr?.message ||
        (typeof anyErr === "string" ? anyErr : JSON.stringify(anyErr));
      return NextResponse.json(
        {
          error: "Razorpay order creation failed",
          detail: msg,
          statusCode: anyErr?.statusCode,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || keyId,
      planId: json.planId,
      interval: json.interval,
      credits:
        json.interval === "annual"
          ? plan.creditsPerMonth * 12
          : plan.creditsPerMonth,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Billing endpoint failed", detail: msg },
      { status: 500 }
    );
  }
}

