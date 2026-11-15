import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { contentSchema, type SiteContent } from "./content-schema";
import publishedContent from "./published-content.json";
import { readDocument, writeDocument } from "./storage";

const initialContent = contentSchema.parse(publishedContent);

export const getContentDocument = cache(async () => {
  const document = await readDocument<SiteContent>("content.json", () => structuredClone(initialContent));
  return { ...document, value: contentSchema.parse(document.value) };
});
export const getPublicContent = unstable_cache(async () => {
  const document = await readDocument<SiteContent>("content.json", () => structuredClone(initialContent));
  return contentSchema.parse(document.value);
}, ["site-content-v1"], { revalidate: 60, tags: ["site-content"] });
export async function saveContent(value: unknown, revision: string | null) {
  const parsed = contentSchema.parse(value);
  parsed.updatedAt = new Date().toISOString();
  const nextRevision = await writeDocument("content.json", parsed, revision);
  return { value: parsed, revision: nextRevision };
}
