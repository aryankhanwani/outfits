/**
 * Google Nano Banana 2 Edit-Fast (Gemini 3.1 Flash Image) — image 1 = person,
 * image 2 = garment. Prompt style uses "image 1" / "image 2" as the docs suggest.
 */
export const DEFAULT_TRY_ON_PROMPT =
  "Virtual try-on using two input images. Image 1 is the person (keep their face, body, pose, hair, and background). " +
  "Image 2 is the clothing item to wear. " +
  "Generate a single full-frame photograph where the person from image 1 is clearly wearing the garment from image 2 on the correct body region (e.g. shirt on torso, pants on legs, dress replaces current outfit). " +
  "The clothing must sit naturally: correct scale, seams, drape, and fabric texture matching image 2. " +
  "Photorealistic, natural lighting, clean skin tones, editorial fashion quality. " +
  "Replace the original outfit entirely with the garment from image 2. Do not keep the previous clothing visible. " +
  "Do NOT output a split screen, collage, diptych, side-by-side panels, or two photos in one frame. " +
  "Do NOT paste the flat garment as a separate rectangle beside the person. One unified photo only.";

export const DEFAULT_CLOTH_IDEAS_PROMPT =
  "You are given a single reference image of a garment or fabric. " +
  "Generate ONE photorealistic product/on-model image that shows how this exact fabric/garment would look as the requested clothing style. " +
  "Keep the material, pattern, print, color, texture and details faithful to the input. " +
  "Use a clean studio background, natural shadows, and realistic folds and seams. " +
  "Do NOT add logos or extra text. Do NOT change the print. " +
  "Return a single image only (no collage, no split screen).";

export const DEFAULT_CLOTH_IDEAS_WITH_PERSON_PROMPT =
  "You are given two reference images. Image 1 is the person. Image 2 is a garment or fabric. " +
  "Generate ONE photorealistic photo where the person from image 1 is wearing the requested clothing style made from the exact fabric/garment in image 2. " +
  "Keep the person's identity, face, body, pose, hair and background from image 1. " +
  "Keep the material, pattern, print, color, texture and details faithful to image 2. " +
  "The clothing must sit naturally with realistic seams, folds, and drape. " +
  "Replace the original outfit appropriately. " +
  "Do NOT add logos or extra text. Do NOT output split screens/collages. One unified photo only.";

/** Model id for WaveSpeed REST API (see api.txt — Google Nano Banana 2 Edit-Fast). */
export const WAVESPEED_EDIT_MODEL = "google/nano-banana-2/edit-fast";

const UPLOAD_BINARY_URL = "https://api.wavespeed.ai/api/v3/media/upload/binary";

export class WavespeedConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WavespeedConfigError";
  }
}

export function normalizeApiKey(raw: string | undefined): string | null {
  if (raw == null) return null;
  let s = raw.trim();
  if (!s) return null;
  if (s.charCodeAt(0) === 0xfeff) {
    s = s.slice(1).trim();
  }
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  if (/^bearer\s+/i.test(s)) {
    s = s.replace(/^bearer\s+/i, "").trim();
  }
  if (/^WAVESPEED_API_KEY\s*=\s*/i.test(s)) {
    s = s.replace(/^WAVESPEED_API_KEY\s*=\s*/i, "").trim();
  }
  s = s.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
  return s || null;
}

export function getWavespeedApiKey(): string {
  const normalized = normalizeApiKey(process.env.WAVESPEED_API_KEY);
  if (!normalized) {
    throw new WavespeedConfigError(
      "Set WAVESPEED_API_KEY in .env.local (or Vercel env). Get a key at https://wavespeed.ai/accesskey"
    );
  }
  return normalized;
}

export function extensionFromMime(mime: string): "jpg" | "png" | "webp" {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

export function mimeFromExtension(ext: string): string {
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
}

/**
 * POST /api/v3/media/upload/binary — upload bytes and receive a CDN URL for inference.
 */
export async function uploadBinary(
  apiKey: string,
  buffer: Buffer,
  filename: string,
  mime: string
): Promise<string> {
  const form = new FormData();
  const bytes = new Uint8Array(buffer);
  form.append("file", new Blob([bytes], { type: mime }), filename);

  const res = await fetch(UPLOAD_BINARY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: form,
  });

  const text = await res.text();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(
      `WaveSpeed upload returned non-JSON (${res.status}): ${text.slice(0, 300)}`
    );
  }

  const parsed = json as {
    code?: number;
    message?: string;
    data?: { download_url?: string };
  };

  if (!res.ok || parsed.code !== 200 || !parsed.data?.download_url) {
    throw new Error(
      parsed.message ||
        `WaveSpeed upload failed (${res.status}): ${text.slice(0, 400)}`
    );
  }

  return parsed.data.download_url;
}
