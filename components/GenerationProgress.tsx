"use client";

const STEPS = [
  { label: "Reading references", hint: "Checking pose, garment shape, and texture" },
  { label: "Composing image", hint: "Balancing fit, light, and fabric" },
  { label: "Final polish", hint: "Preparing the preview" },
];

const TIPS = [
  "Clear photos usually create sharper fabric detail.",
  "Neutral prompts work best for catalog-style output.",
  "A visible garment edge helps preserve shape.",
  "Natural light in the person photo improves realism.",
];

type Props = {
  activeStep: number;
  progress: number;
  elapsedSec: number;
  tipIndex: number;
};

export function GenerationProgress({ activeStep, progress, elapsedSec, tipIndex }: Props) {
  const safeStep = Math.min(Math.max(activeStep, 0), STEPS.length - 1);
  const pct = Math.min(100, Math.max(0, progress));
  const tip = TIPS[tipIndex % TIPS.length];

  return (
    <div role="status" aria-live="polite" aria-busy="true" className="relative overflow-hidden rounded-[28px] border border-[#6df0d0]/20 bg-[#071018] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.28)]">
      <div className="pointer-events-none absolute inset-0 opacity-40" style={{ background: "linear-gradient(110deg, transparent 35%, rgba(109,240,208,0.13) 50%, transparent 65%)", backgroundSize: "200% 100%", animation: "generation-shimmer 2.2s ease-in-out infinite" }} />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-3xl bg-[#6df0d0]/10 ring-1 ring-[#6df0d0]/20">
            <div className="h-8 w-8 rounded-full border-2 border-[#6df0d0]/20 border-t-[#6df0d0]" style={{ animation: "generation-spin 0.8s linear infinite" }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Creating your image</p>
            <p className="mt-1 text-sm text-white/48">{STEPS[safeStep].label}<span className="text-white/30"> · {STEPS[safeStep].hint}</span></p>
            <ol className="mt-4 flex flex-wrap gap-2">
              {STEPS.map((step, i) => (
                <li key={step.label} className={`rounded-full px-3 py-1 text-xs font-semibold ${i <= safeStep ? "bg-[#6df0d0]/14 text-[#bfffee]" : "bg-white/[0.06] text-white/35"}`}>
                  {i + 1}. {step.label.split(" ")[0]}{i < safeStep ? " ✓" : i === safeStep ? " …" : ""}
                </li>
              ))}
            </ol>
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-black/20 px-4 py-3 text-left sm:text-right">
          <p className="text-2xl font-semibold tabular-nums text-white">{elapsedSec}s</p>
          <p className="text-xs text-white/35">elapsed</p>
        </div>
      </div>

      <div className="relative mt-5">
        <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.07]">
          <div className="h-full rounded-full bg-[#6df0d0] transition-[width] duration-300 ease-out" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-3 flex flex-col gap-1 text-xs text-white/38 sm:flex-row sm:items-center sm:justify-between">
          <span>{Math.round(pct)}% complete</span>
          <span className="sm:text-right">Tip: {tip}</span>
        </div>
      </div>
    </div>
  );
}
