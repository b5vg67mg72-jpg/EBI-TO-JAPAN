import { ensureResourceSchema, getResourceBindings, type ResourceRow } from "../../../../lib/resources";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  await ensureResourceSchema();
  const { id } = await context.params;
  const { DB, FILES } = getResourceBindings();
  const row = await DB.prepare("SELECT * FROM resources WHERE id = ? AND status = ? AND resource_kind = ?").bind(id, "published", "exam").first<ResourceRow>();
  if (!row?.preview_key) return Response.json({ error: "Preview not found" }, { status: 404 });
  const object = await FILES.get(row.preview_key);
  if (!object) return Response.json({ error: "Preview file not found" }, { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Content-Type", row.preview_content_type || "application/octet-stream");
  headers.set("Content-Disposition", `inline; filename*=UTF-8''${encodeURIComponent(row.preview_name || "preview")}`);
  headers.set("Cache-Control", "public, max-age=300");
  return new Response(object.body, { headers });
}
