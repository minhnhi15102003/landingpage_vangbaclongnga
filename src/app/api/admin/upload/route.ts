import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { checkOrigin, requireAdmin, AdminError } from "@/lib/admin-auth";
import { failure, json, readBody } from "@/lib/admin-http";
import { saveMedia } from "@/lib/storage";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    checkOrigin(request); await requireAdmin();
    if (!request.headers.get("content-type")?.startsWith("multipart/form-data")) throw new AdminError("Chọn tệp ảnh để tải lên.", 415);
    const bytes = await readBody(request, 3_500_000);
    const form = await new Request(request.url, { method: "POST", headers: { "content-type": request.headers.get("content-type")! }, body: new Uint8Array(bytes) }).formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0 || file.size > 3_000_000 || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new AdminError("Chỉ nhận JPG, PNG hoặc WebP tối đa 3 MB.", 400);
    const buffer = Buffer.from(await file.arrayBuffer());
    const options = { limitInputPixels: 24_000_000, failOn: "warning" as const };
    let metadata;
    try { metadata = await sharp(buffer, options).metadata(); }
    catch { throw new AdminError("Tệp không phải ảnh hợp lệ hoặc độ phân giải quá lớn.", 400); }
    if (!["jpeg", "png", "webp"].includes(metadata.format || "") || (metadata.pages || 1) > 1) throw new AdminError("Không nhận SVG, ảnh động hoặc định dạng không được hỗ trợ.", 400);
    // Decode and re-encode to strip scripts, metadata, EXIF and original filename.
    let output = await sharp(buffer, options).rotate().resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true }).webp({ quality: 88 }).toBuffer();
    if (output.length > 900_000) output = await sharp(buffer, options).rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).webp({ quality: 76 }).toBuffer();
    if (output.length > 900_000) throw new AdminError("Ảnh còn quá lớn sau tối ưu. Hãy chọn ảnh nhỏ hơn.", 400);
    const filename = `${randomUUID()}.webp`;
    await saveMedia(filename, output);
    return json({ src: `/api/media/${filename}`, bytes: output.length });
  } catch (error) { return failure(error); }
}
