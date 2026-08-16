import { ensureResourceSchema, getResourceBindings, requireAdmin, type ResourceRow } from "../../../lib/resources";

export const dynamic = "force-dynamic";
const MAX_FILE_SIZE = 100 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(["pdf", "doc", "docx", "xls", "xlsx", "mp4", "mov", "m4v"]);

function safeFileName(name: string) {
  return name.normalize("NFKC").replace(/[^\p{L}\p{N}._-]+/gu, "-").replace(/-+/g, "-").slice(-120) || "resource";
}

export async function GET(request: Request) {
  const auth = await requireAdmin(request); if (!auth.ok) return auth.response;
  await ensureResourceSchema();
  const { DB } = getResourceBindings();
  const result = await DB.prepare("SELECT * FROM resources ORDER BY created_at DESC LIMIT 100").all<ResourceRow>();
  return Response.json({ resources: result.results });
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request); if (!auth.ok) return auth.response;
  await ensureResourceSchema();
  const form = await request.formData();
  const file = form.get("file");
  const title = String(form.get("title") || "").trim();
  const description = String(form.get("description") || "").trim();
  const category = String(form.get("category") || "EJU");
  const language = String(form.get("language") || "ja");
  const accessLevel = String(form.get("accessLevel") || "public") === "group" ? "group" : "public";
  const status = String(form.get("status") || "draft") === "published" ? "published" : "draft";
  if (!(file instanceof File) || !title) return Response.json({ error: "Title and file are required" }, { status: 400 });
  if (file.size <= 0 || file.size > MAX_FILE_SIZE) return Response.json({ error: "Each file must be between 1 byte and 100 MB" }, { status: 400 });
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  if (!ALLOWED_EXTENSIONS.has(extension)) return Response.json({ error: "Unsupported file type" }, { status: 400 });
  const id = crypto.randomUUID();
  const now = Date.now();
  const fileName = safeFileName(file.name);
  const fileKey = `resources/${id}/${fileName}`;
  const contentType = file.type || "application/octet-stream";
  const { DB, FILES } = getResourceBindings();
  await FILES.put(fileKey, file.stream(), { httpMetadata: { contentType }, customMetadata: { originalName: file.name } });
  try {
    await DB.prepare(`INSERT INTO resources (id, title, description, category, language, access_level, status, file_key, file_name, content_type, size_bytes, uploaded_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(id, title, description, category, language, accessLevel, status, fileKey, file.name, contentType, file.size, "password-admin", now, now).run();
  } catch (error) {
    await FILES.delete(fileKey);
    throw error;
  }
  return Response.json({ ok: true, id });
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin(request); if (!auth.ok) return auth.response;
  await ensureResourceSchema();
  const body = await request.json() as { id?: string; status?: string; accessLevel?: string };
  if (!body.id) return Response.json({ error: "Missing resource id" }, { status: 400 });
  const status = body.status === "published" ? "published" : "draft";
  const accessLevel = body.accessLevel === "group" ? "group" : "public";
  const { DB } = getResourceBindings();
  await DB.prepare("UPDATE resources SET status = ?, access_level = ?, updated_at = ? WHERE id = ?").bind(status, accessLevel, Date.now(), body.id).run();
  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin(request); if (!auth.ok) return auth.response;
  await ensureResourceSchema();
  const body = await request.json() as { id?: string };
  if (!body.id) return Response.json({ error: "Missing resource id" }, { status: 400 });
  const { DB, FILES } = getResourceBindings();
  const row = await DB.prepare("SELECT * FROM resources WHERE id = ?").bind(body.id).first<ResourceRow>();
  if (!row) return Response.json({ error: "Resource not found" }, { status: 404 });
  await FILES.delete(row.file_key);
  await DB.prepare("DELETE FROM resources WHERE id = ?").bind(body.id).run();
  return Response.json({ ok: true });
}
