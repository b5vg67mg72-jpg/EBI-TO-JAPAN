import { ensureResourceSchema, getResourceBindings, requireAdmin, type ResourceRow } from "../../../lib/resources";

export const dynamic = "force-dynamic";
const MAX_FILE_SIZE = 100 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(["pdf", "doc", "docx", "xls", "xlsx", "mp4", "mov", "m4v"]);
const ALLOWED_PREVIEW_EXTENSIONS = new Set(["pdf", "png", "jpg", "jpeg", "webp"]);

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
  const previewFile = form.get("previewFile");
  const title = String(form.get("title") || "").trim();
  const description = String(form.get("description") || "").trim();
  const category = String(form.get("category") || "EJU");
  const language = String(form.get("language") || "ja");
  const resourceKind = String(form.get("resourceKind") || "study") === "exam" ? "exam" : "study";
  const accessLevel = resourceKind === "exam" ? "paid" : String(form.get("accessLevel") || "public") === "group" ? "group" : "public";
  const status = String(form.get("status") || "draft") === "published" ? "published" : "draft";
  const schoolName = String(form.get("schoolName") || "").trim();
  const faculty = String(form.get("faculty") || "").trim();
  const examYear = String(form.get("examYear") || "").trim();
  const subject = String(form.get("subject") || "").trim();
  const priceYen = Math.max(0, Math.round(Number(form.get("priceYen") || 0)));
  const purchaseUrlValue = String(form.get("purchaseUrl") || "").trim();
  let purchaseUrl = "";
  if (purchaseUrlValue) {
    try { const parsed = new URL(purchaseUrlValue); if (!["http:", "https:"].includes(parsed.protocol)) throw new Error(); purchaseUrl = parsed.toString(); }
    catch { return Response.json({ error: "购买链接必须是有效的 http/https 网址" }, { status: 400 }); }
  }
  if (!(file instanceof File) || !title) return Response.json({ error: "Title and file are required" }, { status: 400 });
  if (resourceKind === "exam" && (!schoolName || !examYear || !subject || priceYen <= 0)) return Response.json({ error: "校内考商品需要填写大学、年度、科目和价格" }, { status: 400 });
  if (file.size <= 0 || file.size > MAX_FILE_SIZE) return Response.json({ error: "Each file must be between 1 byte and 100 MB" }, { status: 400 });
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  if (!ALLOWED_EXTENSIONS.has(extension)) return Response.json({ error: "Unsupported file type" }, { status: 400 });
  let previewKey: string | null = null;
  let previewName: string | null = null;
  let previewContentType: string | null = null;
  let previewSizeBytes = 0;
  if (previewFile instanceof File && previewFile.size > 0) {
    const previewExtension = previewFile.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_PREVIEW_EXTENSIONS.has(previewExtension) || previewFile.size > 15 * 1024 * 1024) return Response.json({ error: "试看文件仅支持 PDF、PNG、JPG、WEBP，最大 15 MB" }, { status: 400 });
    previewKey = `previews/${crypto.randomUUID()}/${safeFileName(previewFile.name)}`;
    previewName = previewFile.name;
    previewContentType = previewFile.type || "application/octet-stream";
    previewSizeBytes = previewFile.size;
  }
  const id = crypto.randomUUID();
  const now = Date.now();
  const fileName = safeFileName(file.name);
  const fileKey = `resources/${id}/${fileName}`;
  const contentType = file.type || "application/octet-stream";
  const { DB, FILES } = getResourceBindings();
  await FILES.put(fileKey, file.stream(), { httpMetadata: { contentType }, customMetadata: { originalName: file.name } });
  if (previewKey && previewFile instanceof File) await FILES.put(previewKey, previewFile.stream(), { httpMetadata: { contentType: previewContentType || undefined }, customMetadata: { originalName: previewFile.name } });
  try {
    await DB.prepare(`INSERT INTO resources (id, title, description, category, language, access_level, status, file_key, file_name, content_type, size_bytes, uploaded_by, created_at, updated_at, resource_kind, school_name, faculty, exam_year, subject, price_yen, purchase_url, preview_key, preview_name, preview_content_type, preview_size_bytes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(id, title, description, category, language, accessLevel, status, fileKey, file.name, contentType, file.size, "password-admin", now, now, resourceKind, schoolName, faculty, examYear, subject, priceYen, purchaseUrl, previewKey, previewName, previewContentType, previewSizeBytes).run();
  } catch (error) {
    await FILES.delete(fileKey);
    if (previewKey) await FILES.delete(previewKey);
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
  const { DB } = getResourceBindings();
  const current = await DB.prepare("SELECT resource_kind FROM resources WHERE id = ?").bind(body.id).first<{ resource_kind: string }>();
  const accessLevel = current?.resource_kind === "exam" ? "paid" : body.accessLevel === "group" ? "group" : "public";
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
  if (row.preview_key) await FILES.delete(row.preview_key);
  await DB.prepare("DELETE FROM resources WHERE id = ?").bind(body.id).run();
  return Response.json({ ok: true });
}
