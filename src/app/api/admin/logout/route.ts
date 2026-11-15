import { checkOrigin, logout } from "@/lib/admin-auth";
import { failure, json } from "@/lib/admin-http";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try { checkOrigin(request); await logout(); return json({ ok: true }); }
  catch (error) { return failure(error); }
}
