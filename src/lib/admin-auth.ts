import "server-only";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { compare } from "bcryptjs";
import { z } from "zod";
import { isAllowedAdminOrigin } from "./admin-origin";
import { readDocument, updateDocument, StorageUnavailable } from "./storage";

const WINDOW = 15 * 60 * 1000;
const ABSOLUTE = 8 * 60 * 60 * 1000;
const IDLE = 30 * 60 * 1000;
export const sessionCookie = process.env.NODE_ENV === "production" ? "__Host-ln_admin" : "ln_admin";
const bucketSchema = z.object({ key: z.string(), attempts: z.number(), until: z.number() });
const stateSchema = z.object({
  sessions: z.array(z.object({ hash: z.string(), credentials: z.string(), expires: z.number(), seen: z.number() })).max(20),
  buckets: z.array(bucketSchema).max(256),
});
type State = z.infer<typeof stateSchema>;
const empty = (): State => ({ sessions: [], buckets: [] });

export class AdminError extends Error {
  constructor(message: string, public status = 401, public retryAfter?: number) { super(message); }
}
export function authConfigured() {
  return Boolean(process.env.ADMIN_USERNAME && /^\$2[aby]\$(?:12|13|14)\$[./A-Za-z0-9]{53}$/.test(process.env.ADMIN_PASSWORD_HASH || "") && (process.env.AUTH_SECRET?.length ?? 0) >= 43);
}
function credentials() {
  if (!authConfigured()) throw new AdminError("Chưa thiết lập tài khoản quản trị. Chạy npm.cmd run admin:setup trên máy chủ.", 503);
  return { username: process.env.ADMIN_USERNAME!, passwordHash: process.env.ADMIN_PASSWORD_HASH!, secret: process.env.AUTH_SECRET! };
}
function digest(value: string) { return createHmac("sha256", credentials().secret).update(value).digest("hex"); }
function credentialVersion() { const c = credentials(); return digest(`${c.username}:${c.passwordHash}`); }
function same(a: string, b: string) {
  const ah = createHash("sha256").update(a).digest();
  const bh = createHash("sha256").update(b).digest();
  return timingSafeEqual(ah, bh);
}
function clean(raw: State): State {
  const state = stateSchema.parse(raw), now = Date.now();
  return { sessions: state.sessions.filter((s) => s.expires > now && s.seen + IDLE > now), buckets: state.buckets.filter((b) => b.until > now) };
}
async function mutate(change: (state: State) => State) { return updateDocument("security.json", empty, (s) => change(clean(s))); }

export function checkOrigin(request: Request) {
  if (!isAllowedAdminOrigin(request, process.env.ADMIN_ORIGIN, process.env.NODE_ENV === "development")) throw new AdminError("Yêu cầu không hợp lệ. Mở trang quản trị trên đúng tên miền.", 403);
}

export async function login(username: string, password: string, request: Request) {
  const c = credentials();
  if (Buffer.byteLength(password, "utf8") > 72 || password.length > 72 || username.length > 80) throw new AdminError("Thông tin đăng nhập không đúng.");
  // Vercel supplies x-vercel-forwarded-for. On other hosts use the global
  // account bucket, rather than trusting spoofable generic forwarding headers.
  const ip = process.env.VERCEL ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() : "local-account";
  const ipKey = `ip:${digest(ip || "unknown")}`, accountKey = "account";
  await mutate((state) => {
    const now = Date.now();
    for (const [key, max] of [[accountKey, 5], [ipKey, 10]] as const) {
      let bucket = state.buckets.find((b) => b.key === key);
      if (bucket && bucket.attempts >= max) throw new AdminError("Đã thử đăng nhập nhiều lần. Vui lòng thử lại sau 15 phút.", 429, Math.ceil((bucket.until - now) / 1000));
      if (!bucket) {
        if (state.buckets.length >= 256) throw new AdminError("Đăng nhập tạm thời bị giới hạn. Thử lại sau.", 429, 900);
        bucket = { key, attempts: 0, until: now + WINDOW }; state.buckets.push(bucket);
      }
      bucket.attempts += 1;
    }
    return state;
  });
  // Always run bcrypt, including for a wrong username, to avoid account probing.
  const matches = await compare(password, c.passwordHash);
  if (!same(username, c.username) || !matches) throw new AdminError("Thông tin đăng nhập không đúng.");
  const token = randomBytes(32).toString("base64url"), now = Date.now();
  await mutate((state) => ({
    sessions: [...state.sessions.slice(-9), { hash: digest(token), credentials: credentialVersion(), expires: now + ABSOLUTE, seen: now }],
    buckets: state.buckets.filter((b) => b.key !== accountKey && b.key !== ipKey),
  }));
  (await cookies()).set(sessionCookie, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: ABSOLUTE / 1000,
  });
}

export async function getAdminSession(touch = false) {
  if (!authConfigured()) return null;
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const hash = digest(token), current = await readDocument("security.json", empty);
  const state = clean(current.value), version = credentialVersion();
  const session = state.sessions.find((s) => same(s.hash, hash) && same(s.credentials, version));
  if (!session) return null;
  if (touch && Date.now() - session.seen > 5 * 60 * 1000) {
    let found = false;
    await mutate((s) => {
      found = false;
      s.sessions = s.sessions.map((entry) => { if (same(entry.hash, hash) && same(entry.credentials, version)) { found = true; return { ...entry, seen: Date.now() }; } return entry; });
      return s;
    });
    if (!found) return null;
  }
  return { username: credentials().username, expires: session.expires };
}
export async function requireAdmin() {
  const session = await getAdminSession(true);
  if (!session) throw new AdminError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  return session;
}
export async function logout() {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (token && authConfigured()) await mutate((state) => ({ ...state, sessions: state.sessions.filter((s) => !same(s.hash, digest(token))) }));
  (await cookies()).set(sessionCookie, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
}

export function publicError(error: unknown) {
  if (error instanceof AdminError) return { message: error.message, status: error.status, retryAfter: error.retryAfter };
  if (error instanceof StorageUnavailable) return { message: error.message, status: 503 };
  return { message: "Không thực hiện được thao tác. Vui lòng thử lại.", status: 500 };
}
