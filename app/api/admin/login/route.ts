import { createAdminCookie, passwordMatches } from "../../../lib/admin-session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { password?: string };
  if (!body.password || !(await passwordMatches(body.password))) {
    await new Promise(resolve => setTimeout(resolve, 650));
    return Response.json({ error: "密码错误" }, { status: 401 });
  }
  return Response.json({ ok: true }, { headers: { "Set-Cookie": await createAdminCookie(), "Cache-Control": "no-store" } });
}
