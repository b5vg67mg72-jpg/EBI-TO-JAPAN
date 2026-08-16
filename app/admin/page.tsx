import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { hasAdminSession } from "../lib/admin-session";
import AdminPanel from "./AdminPanel";

export const dynamic = "force-dynamic";

async function ProtectedAdmin() {
  const requestHeaders = await headers();
  if (!(await hasAdminSession(requestHeaders.get("cookie")))) redirect("/admin/login");
  return <AdminPanel />;
}

export default function AdminPage() {
  return <ProtectedAdmin />;
}
