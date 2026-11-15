import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { getContentDocument } from "@/lib/content";
import { storageMode, usesPublishedContent } from "@/lib/storage";
import AdminEditor from "@/components/admin/editor";
import { ADMIN_LOGIN_PATH } from "@/lib/admin-routes";
export default async function AdminPage() {
  if (usesPublishedContent()) redirect(ADMIN_LOGIN_PATH);
  const session = await getAdminSession();
  if (!session) redirect(ADMIN_LOGIN_PATH);
  const document = await getContentDocument();
  return <AdminEditor initial={document.value} initialRevision={document.revision} username={session.username} mode={storageMode()} />;
}
