import { createAdminCookie, passwordMatches } from "../../../lib/admin-session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { password?: string };
  try {
    if (!body.password || !(await passwordMatches(body.password))) {
      await new Promise(resolve => setTimeout(resolve, 650));
      return Response.json({ error: "密码错误" }, { status: 401 });
    }
    return Response.json({ ok: true }, { headers: { "Set-Cookie": await createAdminCookie(), "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "管理员登录尚未配置，请设置 ADMIN_PASSWORD 和 ADMIN_SESSION_SECRET。" }, { status: 503 });
  }
}
