import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { publicError, AdminError } from "./admin-auth";
import { StorageConflict } from "./storage";

export async function readBody(request: Request, limit: number) {
  if (Number(request.headers.get("content-length")) > limit) throw new AdminError("Dữ liệu gửi lên quá lớn.", 413);
  const reader = request.body?.getReader();
  if (!reader) throw new AdminError("Thiếu dữ liệu gửi lên.", 400);
  const chunks: Uint8Array[] = []; let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      total += value.byteLength;
      if (total > limit) { await reader.cancel(); throw new AdminError("Dữ liệu gửi lên quá lớn.", 413); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return Buffer.concat(chunks);
}
export async function readJSON(request: Request, limit = 500_000): Promise<unknown> {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new AdminError("Định dạng yêu cầu không hợp lệ.", 415);
  try { return JSON.parse((await readBody(request, limit)).toString("utf8")); }
  catch (error) { if (error instanceof SyntaxError) throw new AdminError("Dữ liệu JSON không hợp lệ.", 400); throw error; }
}
export function json(value: unknown, status = 200, extra?: Record<string, string>) {
  return NextResponse.json(value, { status, headers: { "Cache-Control": "no-store, private", ...extra } });
}
export function failure(error: unknown) {
  if (error instanceof z.ZodError) return json({ error: "Dữ liệu chưa hợp lệ.", details: error.issues.map((x) => `${x.path.join(".")}: ${x.message}`).slice(0, 8) }, 400);
  if (error instanceof StorageConflict) return json({ error: "Nội dung đã được sửa ở cửa sổ khác. Tải bản mới trước khi lưu để tránh ghi đè." }, 409);
  const e = publicError(error);
  return json({ error: e.message }, e.status, e.retryAfter ? { "Retry-After": String(e.retryAfter) } : undefined);
}
