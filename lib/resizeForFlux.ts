import sharp from "sharp";

const DEFAULT_MAX_EDGE = 1280;

/** Downscale large uploads before WaveSpeed upload/inference; output JPEG for smaller payloads. */
export async function normalizeImageForFlux(
  input: Buffer,
  maxEdge: number = DEFAULT_MAX_EDGE
): Promise<Buffer> {
  const edge = Math.min(2048, Math.max(512, maxEdge));
  return sharp(input)
    .rotate()
    .resize({
      width: edge,
      height: edge,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer();
}

export function jpegBufferToDataUrl(buf: Buffer): string {
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}
