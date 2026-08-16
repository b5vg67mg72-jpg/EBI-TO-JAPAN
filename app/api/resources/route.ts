import { ensureResourceSchema, getResourceBindings, publicResource, type ResourceRow } from "../../lib/resources";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureResourceSchema();
  const { DB } = getResourceBindings();
  const result = await DB.prepare("SELECT * FROM resources WHERE status = ? ORDER BY created_at DESC LIMIT 60").bind("published").all<ResourceRow>();
  return Response.json({ resources: result.results.map(publicResource) });
}
