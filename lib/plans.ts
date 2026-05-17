export type PlanId = "starter" | "creator" | "studio";

export type BillingInterval = "monthly" | "annual";

export type PricingPlan = {
  id: PlanId;
  name: string;
  tagline: string;
  monthlyPriceUsd: number;
  annualPriceUsd: number;
  creditsPerMonth: number;
  features: string[];
  highlight?: boolean;
};

// WaveSpeed cost basis: ~22 images per $1 => cost per image ~= $0.045.
// We price with a healthy margin + room for fees/support.
export const PLANS: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For trying it out",
    monthlyPriceUsd: 9,
    annualPriceUsd: 90,
    creditsPerMonth: 120,
    features: [
      "120 image credits / month",
      "Try-on (2 images) + Cloth ideas (1 image)",
      "Fast CDN delivery",
      "Email support",
    ],
  },
  {
    id: "creator",
    name: "Creator",
    tagline: "For regular shoppers & creators",
    monthlyPriceUsd: 19,
    annualPriceUsd: 190,
    creditsPerMonth: 320,
    highlight: true,
    features: [
      "320 image credits / month",
      "Higher throughput",
      "Priority queue (best-effort)",
      "Email support",
    ],
  },
  {
    id: "studio",
    name: "Studio",
    tagline: "For teams & heavy use",
    monthlyPriceUsd: 49,
    annualPriceUsd: 490,
    creditsPerMonth: 950,
    features: [
      "950 image credits / month",
      "Best-effort priority queue",
      "Usage analytics (coming soon)",
      "Priority support",
    ],
  },
];

export function priceFor(plan: PricingPlan, interval: BillingInterval): number {
  return interval === "annual" ? plan.annualPriceUsd : plan.monthlyPriceUsd;
}

