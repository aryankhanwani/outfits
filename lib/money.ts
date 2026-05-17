export function usdToInrPaise(usd: number): number {
  const rate = Number.parseFloat(process.env.USD_TO_INR ?? "85") || 85;
  const inr = usd * rate;
  return Math.round(inr * 100);
}

