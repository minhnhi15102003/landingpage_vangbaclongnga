import { z } from "zod";
import { checkOrigin, login } from "@/lib/admin-auth";
import { failure, json, readJSON } from "@/lib/admin-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const schema = z.object({ username: z.string().min(1).max(80), password: z.string().min(1).max(72) }).strict();
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const data = schema.parse(await readJSON(request, 2048));
    await login(data.username, data.password, request);
    return json({ ok: true });
  } catch (error) { return failure(error); }
}
