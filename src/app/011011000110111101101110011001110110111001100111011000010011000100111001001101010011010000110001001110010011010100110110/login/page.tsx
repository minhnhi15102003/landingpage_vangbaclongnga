import { redirect } from "next/navigation";
import { authConfigured, getAdminSession } from "@/lib/admin-auth";
import AdminLogin from "@/components/admin/login-form";
import { ADMIN_PATH } from "@/lib/admin-routes";
import { usesPublishedContent } from "@/lib/storage";
export default async function LoginPage() {
  const configured = authConfigured();
  const storageReady = !usesPublishedContent();
  if (storageReady && configured && await getAdminSession()) redirect(ADMIN_PATH);
  return <AdminLogin configured={configured} storageReady={storageReady} deployed={Boolean(process.env.VERCEL)} />;
}
