import { env } from "cloudflare:workers";

export const dynamic = "force-dynamic";

type RuntimeEnv = { DB: D1Database };

export async function POST(request: Request) {
  const form = await request.formData();
  const name = String(form.get("name") || "").trim();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const message = String(form.get("message") || "").trim();
  const website = String(form.get("website") || "").trim();

  if (website) return Response.json({ ok: true });
  if (!name || name.length > 100 || !email || email.length > 254 || !message || message.length > 3000) {
    return Response.json({ error: "Please complete all required fields." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const { DB } = env as unknown as RuntimeEnv;
  if (!DB) return Response.json({ error: "Contact storage is unavailable." }, { status: 503 });
  await DB.prepare(`CREATE TABLE IF NOT EXISTS contact_submissions (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )`).run();
  await DB.prepare("INSERT INTO contact_submissions (id, name, email, message, created_at) VALUES (?, ?, ?, ?, ?)")
    .bind(crypto.randomUUID(), name, email, message, Date.now()).run();

  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
