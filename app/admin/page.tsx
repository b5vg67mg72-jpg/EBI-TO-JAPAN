import { requireChatGPTUser, chatGPTSignOutPath } from "../chatgpt-auth";
import { isAdminEmail } from "../lib/resources";
import AdminPanel from "./AdminPanel";

export const dynamic = "force-dynamic";

async function ProtectedAdmin() {
  const user = await requireChatGPTUser("/admin");
  if (!isAdminEmail(user.email)) {
    return <main className="admin-denied"><div><p>EBI ADMIN</p><h1>管理员权限未开放</h1><p>当前登录账号不在管理员名单中。</p><a href={chatGPTSignOutPath("/admin")}>切换账号</a><a href="/">返回网站</a></div></main>;
  }
  return <AdminPanel adminName={user.displayName} signOutUrl={chatGPTSignOutPath("/")} />;
}

export default function AdminPage() {
  return <ProtectedAdmin />;
}
