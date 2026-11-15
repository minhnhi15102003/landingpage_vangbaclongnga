import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

export class StorageConflict extends Error {}
export class StorageUnavailable extends Error {}
export type Document<T> = { value: T; revision: string | null };
const root = path.join(process.cwd(), ".data");

export function storageMode(): "local" | "github" {
  const mode = process.env.CONTENT_STORAGE ?? "local";
  if (mode !== "local" && mode !== "github") throw new StorageUnavailable("CONTENT_STORAGE không hợp lệ.");
  if (process.env.VERCEL && mode === "local") throw new StorageUnavailable("Vercel cần kho nội dung bền vững; chưa cấu hình CONTENT_STORAGE=github.");
  return mode;
}

function validPath(key: string) {
  if (!/^(?:content\.json|security\.json|media\/[a-f0-9-]{36}\.webp)$/.test(key)) throw new Error("Invalid storage path");
  return key;
}

function config() {
  const { CONTENT_GITHUB_OWNER: owner, CONTENT_GITHUB_REPO: repo, CONTENT_GITHUB_TOKEN: token } = process.env;
  if (!owner || !repo || !token || !/^[\w.-]+$/.test(owner) || !/^[\w.-]+$/.test(repo)) throw new StorageUnavailable("Chưa cấu hình kho nội dung GitHub.");
  return { base: `https://api.github.com/repos/${owner}/${repo}`, token, branch: process.env.CONTENT_GITHUB_BRANCH || "main" };
}
let privateRepoCheck: Promise<void> | undefined;
async function github(pathname: string, init?: RequestInit): Promise<Response> {
  const c = config();
  if (!privateRepoCheck) privateRepoCheck = (async () => {
    const r = await fetch(c.base, { headers: { Authorization: `Bearer ${c.token}`, Accept: "application/vnd.github+json" }, cache: "no-store", signal: AbortSignal.timeout(12000) });
    if (!r.ok || (await r.json()).private !== true) throw new StorageUnavailable("Kho nội dung phải là kho GitHub riêng tư và token phải có quyền truy cập.");
  })().catch((error) => { privateRepoCheck = undefined; throw error; });
  await privateRepoCheck;
  return fetch(`${c.base}/contents/${pathname}`, {
    ...init, headers: { Authorization: `Bearer ${c.token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "Content-Type": "application/json", ...init?.headers },
    cache: "no-store", signal: AbortSignal.timeout(15000),
  });
}

async function readBytes(key: string): Promise<{ bytes: Buffer; revision: string } | null> {
  validPath(key);
  if (storageMode() === "github") {
    const r = await github(`${key}?ref=${encodeURIComponent(config().branch)}`);
    if (r.status === 404) return null;
    if (!r.ok) throw new StorageUnavailable("Không đọc được kho nội dung. Vui lòng thử lại sau.");
    const data = await r.json();
    if (data.type !== "file" || data.encoding !== "base64" || typeof data.content !== "string" || data.size > 1_000_000) throw new StorageUnavailable("Tệp lưu trữ không hợp lệ hoặc quá lớn.");
    return { bytes: Buffer.from(data.content, "base64"), revision: data.sha };
  }
  try {
    const bytes = await fs.readFile(path.join(root, key));
    return { bytes, revision: createHash("sha256").update(bytes).digest("hex") };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

async function localLock<T>(task: () => Promise<T>): Promise<T> {
  await fs.mkdir(root, { recursive: true, mode: 0o700 });
  const lockPath = path.join(root, ".write-lock");
  const deadline = Date.now() + 8000;
  let handle;
  while (!handle) {
    try { handle = await fs.open(lockPath, "wx", 0o600); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      if (Date.now() > deadline) throw new StorageUnavailable("Kho đang bận. Nếu tiến trình bị dừng đột ngột, khởi động lại và xóa .data/.write-lock khi không có tiến trình ghi.");
      await new Promise((resolve) => setTimeout(resolve, 40));
    }
  }
  try { return await task(); }
  finally { await handle.close(); await fs.unlink(lockPath); }
}

async function writeBytes(key: string, bytes: Buffer, expectedRevision: string | null): Promise<string> {
  validPath(key);
  if (bytes.length > 950_000) throw new StorageUnavailable("Tệp quá lớn để lưu.");
  if (storageMode() === "github") {
    const r = await github(key, { method: "PUT", body: JSON.stringify({
      message: key === "security.json" ? "Update admin session state" : "Update website content",
      branch: config().branch, content: bytes.toString("base64"), ...(expectedRevision ? { sha: expectedRevision } : {}),
    }) });
    if (r.status === 409 || r.status === 422) throw new StorageConflict("Dữ liệu đã thay đổi ở cửa sổ khác.");
    if (!r.ok) throw new StorageUnavailable("Không lưu được nội dung. Kiểm tra quyền token và hạn mức GitHub.");
    const result = await r.json();
    return result.content.sha;
  }
  return localLock(async () => {
    const current = await readBytes(key);
    if ((current?.revision ?? null) !== expectedRevision) throw new StorageConflict("Dữ liệu đã thay đổi ở cửa sổ khác.");
    const target = path.join(root, key);
    await fs.mkdir(path.dirname(target), { recursive: true, mode: 0o700 });
    const temp = `${target}.${randomUUID()}.tmp`;
    await fs.writeFile(temp, bytes, { mode: 0o600 });
    await fs.rename(temp, target);
    return createHash("sha256").update(bytes).digest("hex");
  });
}

export async function readDocument<T>(key: "content.json" | "security.json", fallback: () => T): Promise<Document<T>> {
  const entry = await readBytes(key);
  return entry ? { value: JSON.parse(entry.bytes.toString("utf8")) as T, revision: entry.revision } : { value: fallback(), revision: null };
}
export async function writeDocument<T>(key: "content.json" | "security.json", value: T, revision: string | null): Promise<string> {
  return writeBytes(key, Buffer.from(JSON.stringify(value)), revision);
}
export async function updateDocument<T>(key: "security.json", fallback: () => T, change: (value: T) => T): Promise<T> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const current = await readDocument(key, fallback);
    const next = change(current.value);
    try { await writeDocument(key, next, current.revision); return next; }
    catch (error) { if (!(error instanceof StorageConflict)) throw error; }
  }
  throw new StorageUnavailable("Có nhiều thao tác đồng thời. Vui lòng thử lại.");
}
export async function saveMedia(filename: string, bytes: Buffer) { await writeBytes(`media/${filename}`, bytes, null); }
export async function readMedia(filename: string) { return readBytes(`media/${filename}`); }
