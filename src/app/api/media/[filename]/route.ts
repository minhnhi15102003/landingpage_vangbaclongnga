import { readMedia } from "@/lib/storage";
export const runtime = "nodejs";
export async function GET(_request: Request, context: { params: Promise<{ filename: string }> }) {
  const { filename } = await context.params;
  if (!/^[a-f0-9-]{36}\.webp$/.test(filename)) return new Response(null, { status: 404 });
  try {
    const file = await readMedia(filename);
    if (!file) return new Response(null, { status: 404 });
    return new Response(new Uint8Array(file.bytes), { headers: {
      "Content-Type": "image/webp", "Content-Length": String(file.bytes.length),
      "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff",
      ETag: `"${file.revision}"`,
    } });
  } catch { return new Response(null, { status: 503, headers: { "Cache-Control": "no-store" } }); }
}
