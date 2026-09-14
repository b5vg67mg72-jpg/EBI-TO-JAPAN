import { env } from "cloudflare:workers";
import { requireAdmin } from "../../../lib/resources";

export const dynamic = "force-dynamic";

type ContactRow = { id: string; name: string; email: string; message: string; created_at: number };
type RuntimeEnv = { DB: D1Database };

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  const { DB } = env as unknown as RuntimeEnv;
  await DB.prepare(`CREATE TABLE IF NOT EXISTS contact_submissions (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )`).run();
  const result = await DB.prepare("SELECT * FROM contact_submissions ORDER BY created_at DESC LIMIT 100").all<ContactRow>();
  return Response.json({ contacts: result.results }, { headers: { "Cache-Control": "no-store" } });
}
