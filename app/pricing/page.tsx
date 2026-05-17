/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PLANS, priceFor, type BillingInterval, type PlanId, type PricingPlan } from "@/lib/plans";
import { INITIAL_IMAGE_CREDITS } from "@/lib/profile";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return resolve();
    if (window.Razorpay) return resolve();

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Could not open checkout.")));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not open checkout."));
    document.head.appendChild(script);
  });
}

function PricingInner() {
  const search = useSearchParams();
  const router = useRouter();
  const interval = (search.get("interval") === "annual" ? "annual" : "monthly") as BillingInterval;
  const toggleHref = (next: BillingInterval) => `/pricing?interval=${next}`;
  const plans = useMemo(() => PLANS, []);
  const [busyPlan, setBusyPlan] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = async (plan: PricingPlan) => {
    setError(null);
    setBusyPlan(plan.id);

    try {
      await loadRazorpayScript();

      const orderRes = await fetch("/api/billing/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id, interval }),
      });
      const orderJson = (await orderRes.json().catch(() => ({}))) as any;

      if (orderRes.status === 401) {
        const next = encodeURIComponent(`/pricing?interval=${interval}&plan=${plan.id}`);
        router.push(`/login?redirect=${next}`);
        return;
      }
      if (!orderRes.ok) {
        throw new Error(orderJson.detail || orderJson.error || "Could not start payment.");
      }

      const credits =
        interval === "annual" ? plan.creditsPerMonth * 12 : plan.creditsPerMonth;
      const options = {
        key: orderJson.keyId,
        amount: String(orderJson.amount),
        currency: orderJson.currency,
        name: "OutfitAI",
        description: `${plan.name} ${interval} plan - ${credits} credits`,
        order_id: orderJson.orderId,
        handler: async (response: any) => {
          const verifyRes = await fetch("/api/billing/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: plan.id,
              interval,
            }),
          });
          const verifyJson = (await verifyRes.json().catch(() => ({}))) as any;
          if (!verifyRes.ok) {
            throw new Error(verifyJson.error || "Payment was made, but credits were not added.");
          }
          router.push("/studio");
        },
        theme: { color: "#1bcea8" },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed.");
    } finally {
      setBusyPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#07070f] text-[#f8f4ec]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_22%_8%,rgba(27,206,168,0.16),transparent_34%),radial-gradient(circle_at_82%_2%,rgba(124,58,237,0.20),transparent_32%)]" />
      <div className="relative mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1bcea8]">Pricing</p>
          <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-white sm:text-6xl">
            Buy credits and keep creating.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#b9b6c8]">
            New accounts get {INITIAL_IMAGE_CREDITS} free credits. Pick a plan when you need more images.
          </p>

          <div className="mt-8 inline-flex rounded-full border border-white/[0.1] bg-white/[0.05] p-1 text-sm font-semibold shadow-sm backdrop-blur">
            <a href={toggleHref("monthly")} className={`rounded-full px-4 py-2 transition ${interval === "monthly" ? "bg-[#1bcea8] text-[#07070f]" : "text-[#b9b6c8] hover:text-white"}`}>Monthly</a>
            <a href={toggleHref("annual")} className={`rounded-full px-4 py-2 transition ${interval === "annual" ? "bg-[#1bcea8] text-[#07070f]" : "text-[#b9b6c8] hover:text-white"}`}>Annual <span className="ml-1 text-xs opacity-75">save 17%</span></a>
          </div>
        </header>

        {error && (
          <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-red-300/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        )}

        <section className="mt-11 grid gap-5 lg:grid-cols-3">
          {plans.map((p) => {
            const price = priceFor(p, interval);
            const perMonth = interval === "annual" ? Math.round((price / 12) * 100) / 100 : price;
            const credits = interval === "annual" ? p.creditsPerMonth * 12 : p.creditsPerMonth;
            return (
              <div key={p.id} className={`relative rounded-[30px] border p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8 ${p.highlight ? "border-[#1bcea8]/35 bg-[#1bcea8]/10" : "border-white/[0.08] bg-white/[0.05]"}`}>
                {p.highlight && <div className="absolute -top-3 left-6 rounded-full bg-[#1bcea8] px-3 py-1 text-xs font-semibold text-[#07070f] shadow">Most chosen</div>}
                <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">{p.name}</h2>
                <p className="mt-2 text-sm leading-6 text-[#b9b6c8]">{p.tagline}</p>

                <div className="mt-7 flex items-end gap-2">
                  <div className="text-5xl font-semibold tracking-[-0.06em] text-white">${perMonth}</div>
                  <div className="pb-2 text-sm text-[#8b8ba0]">/ month</div>
                </div>
                {interval === "annual" && (
                  <p className="mt-2 text-xs text-[#8b8ba0]">${price} paid once a year</p>
                )}
                <p className="mt-3 rounded-2xl border border-white/[0.08] bg-[#0b0b17] px-4 py-3 text-sm font-semibold text-[#f8f4ec]">{credits} image credits</p>

                <button
                  type="button"
                  disabled={busyPlan !== null}
                  onClick={() => void startCheckout(p)}
                  className={`mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full px-6 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${p.highlight ? "bg-[#1bcea8] text-[#07070f] hover:bg-[#22efc2]" : "border border-white/[0.12] bg-white/[0.06] text-white hover:bg-white/[0.1]"}`}
                >
                  {busyPlan === p.id ? "Opening Razorpay..." : `Choose ${p.name}`}
                </button>

                <ul className="mt-6 space-y-3 text-sm text-[#d8d3e3]">
                  {p.features.map((f) => <li key={f} className="flex gap-3"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#1bcea8]" /><span>{f}</span></li>)}
                </ul>
              </div>
            );
          })}
        </section>

        <section className="mt-8 rounded-[30px] border border-white/[0.08] bg-white/[0.05] p-6 text-center backdrop-blur-xl">
          <p className="text-sm text-[#b9b6c8]">One image uses 1 credit. After payment, credits are added and you go back to Studio.</p>
        </section>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return <Suspense><PricingInner /></Suspense>;
}
