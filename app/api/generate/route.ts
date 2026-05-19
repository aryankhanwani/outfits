import Client from "wavespeed";
import { NextResponse } from "next/server";
import {
  DEFAULT_CLOTH_IDEAS_PROMPT,
  DEFAULT_CLOTH_IDEAS_WITH_PERSON_PROMPT,
  DEFAULT_TRY_ON_PROMPT,
  WavespeedConfigError,
  getWavespeedApiKey,
  mimeFromExtension,
  uploadBinary,
  WAVESPEED_EDIT_MODEL,
} from "@/lib/wavespeed";
import { normalizeImageForFlux } from "@/lib/resizeForFlux";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ensureUserProfile } from "@/lib/profile";

type Resolution = "2k" | "4k";
type OutputFormat = "png" | "jpeg";

function normalizeResolution(raw: string | undefined): Resolution {
  return raw === "4k" ? "4k" : "2k";
}

function normalizeOutputFormat(raw: string | undefined): OutputFormat {
  return raw === "jpeg" || raw === "jpg" ? "jpeg" : "png";
}

export const runtime = "nodejs";

/** Vercel serverless body limit (~4.5 MB on Hobby). */
const MAX_BYTES = 4 * 1024 * 1024;

function buildPrompt(args: {
  mode: "tryon" | "cloth";
  hasPerson: boolean;
  clothingType: string;
  userPrompt: string;
}): string {
  const parts = [
    args.mode === "cloth"
      ? args.hasPerson
        ? DEFAULT_CLOTH_IDEAS_WITH_PERSON_PROMPT
        : DEFAULT_CLOTH_IDEAS_PROMPT
      : DEFAULT_TRY_ON_PROMPT,
  ];
  if (args.mode === "cloth") {
    parts.push(
      "",
      `Clothing to create: ${args.clothingType}.`,
      args.hasPerson
        ? `Use the uploaded fabric to make a ${args.clothingType} and put it on the uploaded person.`
        : `Use the uploaded fabric to make a ${args.clothingType} and show it worn by one real adult model. For shirts and t-shirts, use a male model unless the user asks for something else.`
    );
  }
  if (args.userPrompt.trim()) {
    parts.push("", "Additional direction:", args.userPrompt.trim());
  }
  return parts.join("\n").slice(0, 8000);
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Please log in to use the studio." },
      { status: 401 }
    );
  }

  const admin = createSupabaseAdminClient();
  const profile = await ensureUserProfile(admin, user);
  const availableCredits = profile.credits ?? 0;

  if (availableCredits <= 0) {
    return NextResponse.json(
      { error: "You’re out of image credits. Add credits to keep creating." },
      { status: 402 }
    );
  }

  let apiKey: string;
  try {
    apiKey = getWavespeedApiKey();
  } catch (e) {
    const message =
      e instanceof WavespeedConfigError
        ? e.message
        : "Invalid WAVESPEED_API_KEY configuration.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const form = await request.formData();
  const modeRaw = form.get("mode");
  const mode = modeRaw === "cloth" ? "cloth" : "tryon";
  const person = form.get("person");
  const clothing = form.get("clothing");
  const item = form.get("item");
  const clothingTypeRaw = form.get("clothingType");
  const promptRaw = form.get("prompt");

  if (mode === "tryon") {
    if (!(person instanceof File) || !(clothing instanceof File)) {
      return NextResponse.json(
        {
          error:
            'Expected multipart fields "person" and "clothing" with images.',
        },
        { status: 400 }
      );
    }
  } else {
    if (!(item instanceof File)) {
      return NextResponse.json(
        { error: 'Expected multipart field "item" with an image.' },
        { status: 400 }
      );
    }
  }

  const userPrompt = typeof promptRaw === "string" ? promptRaw : "";

  const files = mode === "tryon" ? [person as File, clothing as File] : [item as File];
  for (const file of files) {
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Each image must be under 4 MB." },
        { status: 400 }
      );
    }
    const mime = file.type || "image/jpeg";
    if (!mime.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image uploads are supported." },
        { status: 400 }
      );
    }
  }

  const maxEdge = Math.min(
    2048,
    Math.max(
      512,
      Number.parseInt(process.env.WAVESPEED_INPUT_MAX_EDGE ?? "1280", 10) ||
        1280
    )
  );

  const hasClothPerson =
    mode === "cloth" && person instanceof File ? true : false;
  const clothingType =
    typeof clothingTypeRaw === "string" && clothingTypeRaw.trim()
      ? clothingTypeRaw.trim().slice(0, 40)
      : "shirt";
  const fullPrompt = buildPrompt({
    mode,
    hasPerson: hasClothPerson,
    clothingType,
    userPrompt,
  });

  const jpegMime = mimeFromExtension("jpg");
  const nextCredits = Math.max(availableCredits - 1, 0);
  const { error: debitError } = await admin
    .from("profiles")
    .update({ credits: nextCredits })
    .eq("id", user.id);

  if (debitError) {
    return NextResponse.json(
      { error: "Credit update failed.", detail: debitError.message },
      { status: 500 }
    );
  }

  const refundCredit = async () => {
    await admin
      .from("profiles")
      .update({ credits: availableCredits })
      .eq("id", user.id);
  };

  let imageUrls: string[];
  try {
    if (mode === "tryon") {
      const personBuf = Buffer.from(await (person as File).arrayBuffer());
      const clothingBuf = Buffer.from(await (clothing as File).arrayBuffer());
      const [personJpeg, clothingJpeg] = await Promise.all([
        normalizeImageForFlux(personBuf, maxEdge),
        normalizeImageForFlux(clothingBuf, maxEdge),
      ]);
      const [personUrl, clothingUrl] = await Promise.all([
        uploadBinary(apiKey, personJpeg, "person.jpg", jpegMime),
        uploadBinary(apiKey, clothingJpeg, "clothing.jpg", jpegMime),
      ]);
      imageUrls = [personUrl, clothingUrl];
    } else {
      const itemBuf = Buffer.from(await (item as File).arrayBuffer());
      const itemJpeg = await normalizeImageForFlux(itemBuf, maxEdge);
      const itemUrl = await uploadBinary(apiKey, itemJpeg, "item.jpg", jpegMime);
      if (person instanceof File) {
        const personBuf = Buffer.from(await person.arrayBuffer());
        const personJpeg = await normalizeImageForFlux(personBuf, maxEdge);
        const personUrl = await uploadBinary(
          apiKey,
          personJpeg,
          "person.jpg",
          jpegMime
        );
        imageUrls = [personUrl, itemUrl];
      } else {
        imageUrls = [itemUrl];
      }
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload failed.";
    await refundCredit();
    return NextResponse.json(
      { error: "Image upload failed.", detail: msg, credits: availableCredits },
      { status: 502 }
    );
  }

  const inferenceTimeoutSec = Math.min(
    3600,
    Math.max(
      60,
      Number.parseInt(process.env.WAVESPEED_INFERENCE_TIMEOUT_SEC ?? "600", 10) ||
        600
    )
  );

  // Nano Banana 2 docs warn sync mode can time out (Google compute variability).
  // Default to async + fast polling, but allow WAVESPEED_SYNC_MODE=true to opt in.
  const enableSyncMode = process.env.WAVESPEED_SYNC_MODE === "true";

  const client = new Client(apiKey, {
    connectionTimeout: enableSyncMode ? inferenceTimeoutSec : 30,
    timeout: inferenceTimeoutSec,
  });

  const resolution = normalizeResolution(process.env.WAVESPEED_RESOLUTION);
  const outputFormat = normalizeOutputFormat(process.env.WAVESPEED_OUTPUT_FORMAT);
  const aspectRatio = process.env.WAVESPEED_ASPECT_RATIO?.trim();
  const enableWebSearch = process.env.WAVESPEED_WEB_SEARCH === "true";

  const input: Record<string, unknown> = {
    enable_base64_output: false,
    enable_web_search: enableWebSearch,
    images: imageUrls,
    output_format: outputFormat,
    prompt: fullPrompt,
    resolution,
  };
  if (aspectRatio) {
    input.aspect_ratio = aspectRatio;
  }

  let outputs: unknown;
  try {
    const result = await client.run(
      process.env.WAVESPEED_MODEL?.trim() || WAVESPEED_EDIT_MODEL,
      input,
      {
        enableSyncMode,
        timeout: inferenceTimeoutSec,
        pollInterval: 0.4,
      }
    );
    outputs = result.outputs;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Image generation failed.";
    await refundCredit();
    return NextResponse.json(
      { error: "Image generation failed.", detail: msg, credits: availableCredits },
      { status: 502 }
    );
  }

  const outUrl = Array.isArray(outputs) ? outputs[0] : undefined;
  if (typeof outUrl !== "string" || !outUrl.startsWith("http")) {
    await refundCredit();
    return NextResponse.json(
      {
        error: "Unexpected image response.",
        detail: "No output image URL in response.",
        credits: availableCredits,
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ imageUrl: outUrl, credits: nextCredits });
}
