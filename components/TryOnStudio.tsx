/* eslint-disable react-hooks/static-components, react-hooks/set-state-in-effect, @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import { GenerationProgress } from "@/components/GenerationProgress";

type Mode = "tryon" | "cloth";
type Slot = "person" | "clothing" | "item";
type Status = "idle" | "generating" | "done" | "error";
type ClothingType =
  | "t-shirt"
  | "shirt"
  | "kurta"
  | "dress"
  | "hoodie"
  | "jacket"
  | "pants"
  | "skirt";

type UploadState = {
  file: File | null;
  previewUrl: string | null;
};

type IconName =
  | "sparkles"
  | "user"
  | "shirt"
  | "image"
  | "wand"
  | "download"
  | "coins"
  | "check"
  | "alert"
  | "upload"
  | "brush"
  | "bolt"
  | "arrow";

const initialSlot: UploadState = { file: null, previewUrl: null };

const iconPaths: Record<IconName, string> = {
  sparkles:
    "M12 2l1.7 5.2L19 9l-5.3 1.8L12 16l-1.7-5.2L5 9l5.3-1.8L12 2Zm7 10 1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8 9a8 8 0 0 0-16 0",
  shirt:
    "M8 4 5 6.2 3 11l3 1.3V20h12v-7.7L21 11l-2-4.8L16 4a5 5 0 0 1-8 0Z",
  image:
    "M4 5h16v14H4V5Zm3 10 3.2-3.2 2.5 2.5L15.5 11 20 15.5M8 9h.01",
  wand: "m5 19 14-14M14 5l5 5M6 5l1-2 1 2 2 1-2 1-1 2-1-2-2-1 2-1Zm12 10 1-2 1 2 2 1-2 1-1 2-1-2-2-1 2-1Z",
  download: "M12 3v11m0 0 4-4m-4 4-4-4M4 17v3h16v-3",
  coins:
    "M12 7c4.4 0 8-1.3 8-3s-3.6-3-8-3-8 1.3-8 3 3.6 3 8 3Zm8-3v5c0 1.7-3.6 3-8 3s-8-1.3-8-3V4m16 5v5c0 1.7-3.6 3-8 3s-8-1.3-8-3V9m16 5v5c0 1.7-3.6 3-8 3s-8-1.3-8-3v-5",
  check: "M20 6 9 17l-5-5",
  alert: "M12 3 2.8 20h18.4L12 3Zm0 6v5m0 3h.01",
  upload: "M12 16V4m0 0 4 4m-4-4-4 4M4 16v4h16v-4",
  brush: "M16 3l5 5-8.5 8.5a3.5 3.5 0 0 1-5-5L16 3ZM7 15c-2.2.3-4 1.8-4 4 2.2 0 3.7-.7 5-2",
  bolt: "M13 2 4 14h7l-1 8 10-13h-7l1-7Z",
  arrow: "M5 12h14m-6-6 6 6-6 6",
};

const clothingTypes: { id: ClothingType; label: string; icon: IconName }[] = [
  { id: "t-shirt", label: "T-shirt", icon: "shirt" },
  { id: "shirt", label: "Shirt", icon: "shirt" },
  { id: "kurta", label: "Kurta", icon: "shirt" },
  { id: "dress", label: "Dress", icon: "sparkles" },
  { id: "hoodie", label: "Hoodie", icon: "shirt" },
  { id: "jacket", label: "Jacket", icon: "shirt" },
  { id: "pants", label: "Pants", icon: "brush" },
  { id: "skirt", label: "Skirt", icon: "sparkles" },
];

function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  const strokeOnly = ["user", "image", "download", "upload", "arrow", "check", "alert"].includes(name);
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill={strokeOnly ? "none" : "currentColor"}>
      <path
        d={iconPaths[name]}
        stroke={strokeOnly ? "currentColor" : undefined}
        strokeWidth={strokeOnly ? 1.8 : undefined}
        strokeLinecap={strokeOnly ? "round" : undefined}
        strokeLinejoin={strokeOnly ? "round" : undefined}
      />
    </svg>
  );
}

function fileLabel(file: File | null) {
  if (!file) return "No file selected";
  const size = file.size / 1024 / 1024;
  return `${file.name} · ${size.toFixed(size >= 1 ? 1 : 2)} MB`;
}

export function TryOnStudio({ initialCredits = 0 }: { initialCredits?: number }) {
  const personInputId = useId();
  const clothingInputId = useId();
  const itemInputId = useId();

  const [mode, setMode] = useState<Mode>("tryon");
  const [person, setPerson] = useState<UploadState>(initialSlot);
  const [clothing, setClothing] = useState<UploadState>(initialSlot);
  const [item, setItem] = useState<UploadState>(initialSlot);
  const [clothingType, setClothingType] = useState<ClothingType>("shirt");
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [resultDataUrls, setResultDataUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [credits, setCredits] = useState(initialCredits);

  const busy = status === "generating";
  const requiredReady = mode === "tryon" ? Boolean(person.file && clothing.file) : Boolean(item.file);
  const canGenerate = requiredReady && credits > 0 && !busy;

  const revokePreview = useCallback((url: string | null) => {
    if (url) URL.revokeObjectURL(url);
  }, []);

  const setSlot = useCallback(
    (slot: Slot, next: UploadState) => {
      if (slot === "person") {
        setPerson((prev) => {
          revokePreview(prev.previewUrl);
          return next;
        });
      } else if (slot === "item") {
        setItem((prev) => {
          revokePreview(prev.previewUrl);
          return next;
        });
      } else {
        setClothing((prev) => {
          revokePreview(prev.previewUrl);
          return next;
        });
      }
    },
    [revokePreview]
  );

  useEffect(() => () => {
    revokePreview(person.previewUrl);
    revokePreview(clothing.previewUrl);
    revokePreview(item.previewUrl);
  }, [person.previewUrl, clothing.previewUrl, item.previewUrl, revokePreview]);

  const onFile = (slot: Slot, file: File | null) => {
    setStatus("idle");
    setStatusMessage("");
    setError(null);
    setResultDataUrls([]);
    if (!file) {
      setSlot(slot, initialSlot);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file: JPG, PNG, or WebP.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Use an image under 8 MB for a faster upload.");
      return;
    }
    setSlot(slot, { file, previewUrl: URL.createObjectURL(file) });
  };

  const clearSlot = (slot: Slot) => onFile(slot, null);

  const run = async () => {
    setError(null);
    setResultDataUrls([]);

    if (!requiredReady) {
      setError(mode === "tryon" ? "Add your photo and the clothing photo first." : "Upload the fabric photo first.");
      return;
    }
    if (credits <= 0) {
      setError("You’re out of image credits. Add credits to keep creating.");
      return;
    }

    setStatus("generating");

    const fd = new FormData();
    fd.append("mode", mode);
    if (mode === "tryon") {
      fd.append("person", person.file!);
      fd.append("clothing", clothing.file!);
    } else {
      fd.append("item", item.file!);
      if (person.file) fd.append("person", person.file);
      fd.append("clothingType", clothingType);
    }
    if (prompt.trim()) fd.append("prompt", prompt.trim());

    try {
      const genRes = await fetch("/api/generate", { method: "POST", body: fd });
      const genJson = (await genRes.json().catch(() => ({}))) as {
        imageUrl?: string;
        error?: string;
        detail?: string;
        credits?: number;
      };

      if (!genRes.ok) throw new Error(genJson.error || genJson.detail || `Generation failed (${genRes.status})`);
      const imageUrl = genJson.imageUrl;
      if (!imageUrl?.startsWith("http")) throw new Error("No image was returned.");

      const preload = new Image();
      preload.src = imageUrl;
      setResultDataUrls([imageUrl]);
      if (typeof genJson.credits === "number") setCredits(genJson.credits);
      setStatus("done");
      setStatusMessage("Your image is ready.");
    } catch (e) {
      setStatus("error");
      setStatusMessage("");
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  };

  useEffect(() => {
    if (!busy) {
      setProgress(0);
      setElapsedSec(0);
      return;
    }
    setProgress(12);
    const started = Date.now();
    const id = window.setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - started) / 1000));
      setProgress((p) => (p >= 92 ? p : Math.min(92, p + Math.max(0.28, (92 - p) * 0.048))));
    }, 260);
    return () => window.clearInterval(id);
  }, [busy]);

  const loadingStep = status === "generating" ? (elapsedSec > 18 ? 2 : elapsedSec > 6 ? 1 : 0) : 0;
  const tipIndex = Math.floor(elapsedSec / 7) % 4;

  const quickPrompts = useMemo(
    () => [
      { label: "Clean catalog", prompt: "Neutral studio background, clean catalog lighting, natural fit, realistic fabric texture." },
      { label: "Streetwear", prompt: "Modern streetwear styling, relaxed fit, editorial lighting, clean urban background." },
      { label: "Premium e-com", prompt: "Premium e-commerce product photo, soft shadows, polished styling, high-end retail look." },
      { label: "Minimal", prompt: "Minimal background, natural pose, accurate garment shape, no extra accessories." },
    ],
    []
  );

  const modeCopy = {
    tryon: {
      eyebrow: "Virtual try-on",
      title: "Put a garment on a person",
      detail: "Best for product photos, flat lays, and model shots where you want a realistic try-on result.",
      cta: "Generate try-on",
    },
    cloth: {
      eyebrow: "Design preview",
      title: "Turn fabric into outfit ideas",
      detail: "Upload fabric, pick what to make, and see it worn by a person. Add a person photo if you want the result on that person.",
      cta: "Generate style",
    },
  } as const;

  const DropZone = ({
    slot,
    title,
    subtitle,
    inputId,
    state,
    icon,
    required = true,
  }: {
    slot: Slot;
    title: string;
    subtitle: string;
    inputId: string;
    state: UploadState;
    icon: IconName;
    required?: boolean;
  }) => {
    const [dragging, setDragging] = useState(false);
    return (
      <div className="rounded-[26px] border border-white/[0.09] bg-white/[0.045] p-3 shadow-[0_20px_80px_rgba(0,0,0,0.22)]">
        <div className="mb-3 flex items-start justify-between gap-3 px-2 pt-2">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/[0.08] text-[#6df0d0] ring-1 ring-white/[0.09]">
              <Icon name={icon} className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">{title}</h3>
                {!required && <span className="rounded-full bg-white/[0.07] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">Optional</span>}
              </div>
              <p className="mt-1 text-xs leading-5 text-white/48">{subtitle}</p>
            </div>
          </div>
          {state.file && (
            <button
              type="button"
              disabled={busy}
              onClick={() => clearSlot(slot)}
              className="rounded-full border border-white/[0.1] px-3 py-1 text-xs font-semibold text-white/55 transition hover:border-red-300/40 hover:text-red-200"
            >
              Remove
            </button>
          )}
        </div>

        <label
          htmlFor={inputId}
          onDragEnter={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            onFile(slot, e.dataTransfer.files?.[0] ?? null);
          }}
          className={`relative flex min-h-[235px] cursor-pointer overflow-hidden rounded-[22px] border border-dashed transition ${
            dragging
              ? "border-[#6df0d0] bg-[#6df0d0]/10"
              : state.previewUrl
                ? "border-white/[0.12] bg-[#0a0d17]"
                : "border-white/[0.13] bg-[#0a0d17] hover:border-[#6df0d0]/60 hover:bg-[#0e1421]"
          }`}
        >
          <input
            id={inputId}
            name={slot}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              onFile(slot, e.target.files?.[0] ?? null);
              e.target.value = "";
            }}
          />

          {state.previewUrl ? (
            <>
              <img src={state.previewUrl} alt="Selected upload preview" className="h-full min-h-[235px] w-full object-contain p-3" />
              <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-white/[0.09] bg-black/55 px-3 py-2 text-xs text-white/75 backdrop-blur-xl">
                <span className="line-clamp-1">{fileLabel(state.file)}</span>
              </div>
            </>
          ) : (
            <div className="m-auto flex max-w-[250px] flex-col items-center px-6 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-3xl bg-white/[0.07] text-[#6df0d0] ring-1 ring-white/[0.09]">
                <Icon name="upload" className="h-6 w-6" />
              </span>
              <span className="mt-4 text-sm font-semibold text-white">Drop image here</span>
              <span className="mt-1 text-xs leading-5 text-white/45">or click to browse JPG, PNG, or WebP under 8 MB</span>
            </div>
          )}
        </label>
      </div>
    );
  };

  const activeInputs = mode === "tryon" ? [person.file, clothing.file] : [item.file, clothingType];
  const completedSteps = activeInputs.filter(Boolean).length + (prompt.trim() ? 1 : 0) + (resultDataUrls.length ? 1 : 0);

  return (
    <div className="relative overflow-hidden rounded-[34px] border border-white/[0.08] bg-[#080a12] text-white shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(109,240,208,0.16),transparent_34%),radial-gradient(circle_at_86%_10%,rgba(130,87,255,0.18),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.055),transparent_24%)]" />

      <div className="relative grid min-h-[760px] lg:grid-cols-[360px_1fr]">
        <aside className="border-b border-white/[0.08] bg-white/[0.035] p-5 backdrop-blur-xl lg:border-b-0 lg:border-r lg:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#6df0d0]">Create</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Studio</h2>
            </div>
            <div className="rounded-2xl border border-white/[0.1] bg-black/20 px-3 py-2 text-right">
              <div className="flex items-center gap-2 text-xs font-semibold text-white/55"><Icon name="coins" className="h-4 w-4 text-[#6df0d0]" /> Credits</div>
              <p className="mt-1 text-2xl font-semibold tracking-[-0.06em]">{credits}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {([
              { id: "tryon" as const, icon: "shirt" as IconName, title: "Try-on", text: "Person + clothing" },
              { id: "cloth" as const, icon: "brush" as IconName, title: "Style ideas", text: "Fabric + clothing type" },
            ]).map((option) => (
              <button
                key={option.id}
                type="button"
                disabled={busy}
                onClick={() => {
                  setMode(option.id);
                  setPrompt("");
                  setError(null);
                  setStatusMessage("");
                  setResultDataUrls([]);
                }}
                className={`group flex items-center gap-3 rounded-3xl border p-3 text-left transition ${
                  mode === option.id
                    ? "border-[#6df0d0]/45 bg-[#6df0d0]/12 text-white shadow-[0_12px_45px_rgba(109,240,208,0.08)]"
                    : "border-white/[0.08] bg-white/[0.035] text-white/55 hover:border-white/[0.16] hover:bg-white/[0.065] hover:text-white"
                }`}
              >
                <span className={`grid h-12 w-12 place-items-center rounded-2xl ${mode === option.id ? "bg-[#6df0d0] text-[#05070d]" : "bg-white/[0.07] text-white/60 group-hover:text-white"}`}>
                  <Icon name={option.icon} className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{option.title}</span>
                  <span className="mt-0.5 block text-xs text-current opacity-60">{option.text}</span>
                </span>
                {mode === option.id && <Icon name="check" className="h-5 w-5 text-[#6df0d0]" />}
              </button>
            ))}
          </div>

          <div className="mt-7 rounded-3xl border border-white/[0.08] bg-black/20 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">Flow</p>
            <div className="mt-4 space-y-3">
              {[
                { label: mode === "tryon" ? "Add two images" : "Add fabric photo", done: requiredReady },
                { label: mode === "tryon" ? "Tune style" : "Pick clothing", done: mode === "tryon" ? Boolean(prompt.trim()) : Boolean(clothingType) },
                { label: "Generate result", done: resultDataUrls.length > 0 },
              ].map((step, index) => (
                <div key={step.label} className="flex items-center gap-3">
                  <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${step.done ? "bg-[#6df0d0] text-[#05070d]" : "bg-white/[0.07] text-white/35"}`}>
                    {step.done ? <Icon name="check" className="h-4 w-4" /> : index + 1}
                  </span>
                  <span className={step.done ? "text-sm font-medium text-white" : "text-sm text-white/45"}>{step.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-white/[0.08] bg-white/[0.035] p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white"><Icon name="bolt" className="h-4 w-4 text-[#6df0d0]" /> Better results</div>
            <p className="mt-2 text-xs leading-5 text-white/45">Use clear photos and good light. One image uses one credit.</p>
          </div>
        </aside>

        <section className="min-w-0 p-4 sm:p-6 lg:p-7">
          <div className="mb-6 flex flex-col gap-4 rounded-[30px] border border-white/[0.08] bg-white/[0.045] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6df0d0]">{modeCopy[mode].eyebrow}</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">{modeCopy[mode].title}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/52">{modeCopy[mode].detail}</p>
            </div>
            {credits <= 0 ? (
              <Link
                href="/pricing"
                className="group inline-flex min-h-14 shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#6df0d0] px-6 text-sm font-extrabold text-[#05070d] shadow-[0_18px_55px_rgba(109,240,208,0.24)] transition hover:-translate-y-0.5 hover:bg-[#8cf8dd]"
              >
                Buy more credits
                <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
            ) : (
              <button
                type="button"
                disabled={!canGenerate}
                onClick={() => void run()}
                className="group inline-flex min-h-14 shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#6df0d0] px-6 text-sm font-extrabold text-[#05070d] shadow-[0_18px_55px_rgba(109,240,208,0.24)] transition hover:-translate-y-0.5 hover:bg-[#8cf8dd] disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-white/[0.1] disabled:text-white/35 disabled:shadow-none"
              >
                {busy ? "Creating..." : `${modeCopy[mode].cta} - 1 credit`}
                {!busy && <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-0.5" />}
              </button>
            )}
          </div>

          <div className="grid gap-5 xl:grid-cols-[1fr_390px]">
            <div className="space-y-5">
              {mode === "tryon" ? (
                <div className="grid gap-5 md:grid-cols-2">
                  <DropZone slot="person" title="Person photo" subtitle="Full or half body with a visible pose." inputId={personInputId} state={person} icon="user" />
                  <DropZone slot="clothing" title="Garment photo" subtitle="Flat lay, hanger, or product shot." inputId={clothingInputId} state={clothing} icon="shirt" />
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2">
                  <DropZone slot="item" title="Fabric photo" subtitle="Required. Upload the fabric, print, or textile you want to use." inputId={itemInputId} state={item} icon="image" />
                  <DropZone slot="person" title="Person photo" subtitle="Optional. Add this if you want the clothing on this person." inputId={personInputId} state={person} icon="user" required={false} />
                </div>
              )}

              {mode === "cloth" && (
                <div className="rounded-[26px] border border-white/[0.09] bg-white/[0.045] p-4 shadow-[0_20px_80px_rgba(0,0,0,0.18)]">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white"><Icon name="shirt" className="h-4 w-4 text-[#6df0d0]" /> Choose clothing</div>
                    <p className="mt-1 text-xs leading-5 text-white/45">Pick what you want to make from the fabric.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {clothingTypes.map((itemType) => (
                      <button
                        key={itemType.id}
                        type="button"
                        disabled={busy}
                        onClick={() => setClothingType(itemType.id)}
                        className={`min-h-24 rounded-3xl border p-3 text-left transition ${
                          clothingType === itemType.id
                            ? "border-[#6df0d0]/50 bg-[#6df0d0]/12 text-white"
                            : "border-white/[0.08] bg-[#0a0d17] text-white/58 hover:border-[#6df0d0]/45 hover:text-white"
                        }`}
                      >
                        <span className={`grid h-10 w-10 place-items-center rounded-2xl ${clothingType === itemType.id ? "bg-[#6df0d0] text-[#05070d]" : "bg-white/[0.07] text-[#6df0d0]"}`}>
                          <Icon name={itemType.icon} className="h-5 w-5" />
                        </span>
                        <span className="mt-3 block text-sm font-bold">{itemType.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-[26px] border border-white/[0.09] bg-white/[0.045] p-4 shadow-[0_20px_80px_rgba(0,0,0,0.18)]">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-white"><Icon name="wand" className="h-4 w-4 text-[#6df0d0]" /> Style direction</div>
                    <p className="mt-1 text-xs leading-5 text-white/45">Optional. Keep it short. Say the background, fit, or look you want.</p>
                  </div>
                  {prompt && (
                    <button type="button" disabled={busy} onClick={() => setPrompt("")} className="rounded-full border border-white/[0.1] px-3 py-1 text-xs font-semibold text-white/50 hover:text-white">Clear</button>
                  )}
                </div>
                <div className="mb-3 flex flex-wrap gap-2">
                  {quickPrompts.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      disabled={busy}
                      onClick={() => setPrompt(p.prompt)}
                      className="rounded-full border border-white/[0.1] bg-[#0a0d17] px-3 py-2 text-xs font-semibold text-white/60 transition hover:border-[#6df0d0]/45 hover:text-white disabled:opacity-50"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <textarea
                  value={prompt}
                  disabled={busy}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Example: premium catalog lighting, neutral background, natural fabric texture"
                  rows={4}
                  className="w-full resize-y rounded-[22px] border border-white/[0.1] bg-[#0a0d17] px-4 py-4 text-sm leading-6 text-white outline-none transition placeholder:text-white/28 focus:border-[#6df0d0]/60 focus:ring-4 focus:ring-[#6df0d0]/10 disabled:opacity-60"
                />
              </div>

              {busy && <GenerationProgress activeStep={loadingStep} progress={progress} elapsedSec={elapsedSec} tipIndex={tipIndex} />}

              {error && (
                <div role="alert" className="flex items-start gap-3 rounded-[24px] border border-red-300/25 bg-red-500/10 p-4 text-sm leading-6 text-red-100">
                  <Icon name="alert" className="mt-0.5 h-5 w-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {statusMessage && !error && !busy && (
                <div className="flex items-center gap-3 rounded-[24px] border border-[#6df0d0]/20 bg-[#6df0d0]/10 p-4 text-sm font-medium text-[#bfffee]">
                  <Icon name="check" className="h-5 w-5" />
                  {statusMessage}
                </div>
              )}
            </div>

            <aside className="rounded-[30px] border border-white/[0.09] bg-white/[0.045] p-4 shadow-[0_20px_80px_rgba(0,0,0,0.2)] xl:sticky xl:top-6 xl:self-start">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">Preview</p>
                  <h3 className="mt-1 text-lg font-semibold tracking-[-0.03em] text-white">Output</h3>
                </div>
                <span className="rounded-full border border-white/[0.1] px-3 py-1 text-xs font-semibold text-white/45">{completedSteps}/4 ready</span>
              </div>

              <div className="relative grid min-h-[430px] place-items-center overflow-hidden rounded-[26px] border border-white/[0.08] bg-[#0a0d17]">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.035)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.035)_50%,rgba(255,255,255,0.035)_75%,transparent_75%,transparent)] bg-[length:24px_24px] opacity-25" />

                {resultDataUrls.length > 0 ? (
                  <div className="relative w-full">
                    <img src={resultDataUrls[0]} alt="Generated outfit preview" className="max-h-[520px] w-full object-contain p-3" fetchPriority="high" decoding="async" />
                  </div>
                ) : busy ? (
                  <div className="relative flex flex-col items-center px-8 text-center">
                    <div className="h-48 w-40 animate-pulse rounded-[32px] bg-white/[0.07]" />
                    <p className="mt-5 text-sm font-semibold text-white">Building your preview</p>
                    <p className="mt-1 text-xs leading-5 text-white/42">You can keep this page open while the result finishes.</p>
                  </div>
                ) : (
                  <div className="relative flex flex-col items-center px-8 text-center">
                    <span className="grid h-16 w-16 place-items-center rounded-[28px] bg-white/[0.07] text-[#6df0d0] ring-1 ring-white/[0.1]"><Icon name="sparkles" className="h-7 w-7" /></span>
                    <p className="mt-5 text-sm font-semibold text-white">Your result appears here</p>
                    <p className="mt-2 max-w-[260px] text-xs leading-5 text-white/42">Add the required images, choose a style direction, then generate.</p>
                  </div>
                )}
              </div>

              {resultDataUrls.length > 0 ? (
                <a
                  href={resultDataUrls[0]}
                  download="outfitai-result.png"
                  className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white text-sm font-extrabold text-[#05070d] transition hover:bg-[#e9fff9]"
                >
                  <Icon name="download" className="h-4 w-4" /> Download image
                </a>
              ) : (
                <div className="mt-4 rounded-2xl border border-white/[0.08] bg-black/20 p-4 text-xs leading-5 text-white/45">
                  <span className="font-semibold text-white/70">Next:</span>{" "}
                  {mode === "tryon"
                    ? person.file
                      ? clothing.file
                        ? "Review your style direction and generate."
                        : "Add the clothing photo."
                      : "Add the person photo."
                    : item.file
                      ? `Ready to make a ${clothingType}.`
                      : "Add the fabric photo."}
                </div>
              )}
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
}
