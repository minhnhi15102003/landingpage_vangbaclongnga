import { redirect } from "next/navigation";
import { authConfigured, getAdminSession } from "@/lib/admin-auth";
import AdminLogin from "@/components/admin/login-form";
import { ADMIN_PATH } from "@/lib/admin-routes";
export default async function LoginPage() {
  const configured = authConfigured();
  if (configured && await getAdminSession()) redirect(ADMIN_PATH);
  return <AdminLogin configured={configured} />;
}
