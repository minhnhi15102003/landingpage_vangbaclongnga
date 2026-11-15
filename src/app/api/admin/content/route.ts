import { z } from "zod";
import { revalidateTag } from "next/cache";
import { checkOrigin, requireAdmin } from "@/lib/admin-auth";
import { getContentDocument, saveContent } from "@/lib/content";
import { failure, json, readJSON } from "@/lib/admin-http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  try { await requireAdmin(); return json(await getContentDocument()); }
  catch (error) { return failure(error); }
}
const payload = z.object({ value: z.unknown(), revision: z.string().max(100).nullable() }).strict();
export async function PUT(request: Request) {
  try {
    checkOrigin(request); await requireAdmin();
    const data = payload.parse(await readJSON(request));
    const saved = await saveContent(data.value, data.revision);
    revalidateTag("site-content");
    return json(saved);
  } catch (error) { return failure(error); }
}
