import { ensureResourceSchema, getResourceBindings, type ResourceRow } from "../../../../lib/resources";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  await ensureResourceSchema();
  const { id } = await context.params;
  const { DB, FILES } = getResourceBindings();
  const row = await DB.prepare("SELECT * FROM resources WHERE id = ? AND status = ? AND access_level = ? AND resource_kind != ?").bind(id, "published", "public", "exam").first<ResourceRow>();
  if (!row) return Response.json({ error: "Resource not found" }, { status: 404 });
  const object = await FILES.get(row.file_key);
  if (!object) return Response.json({ error: "File not found" }, { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Content-Type", row.content_type);
  headers.set("Content-Length", String(row.size_bytes));
  headers.set("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(row.file_name)}`);
  headers.set("Cache-Control", "private, max-age=60");
  return new Response(object.body, { headers });
}
