import { env } from "cloudflare:workers";
import { requirePasswordAdmin } from "./admin-session";

export type ResourceRow = {
  id: string;
  title: string;
  description: string;
  category: string;
  language: string;
  access_level: "public" | "group";
  status: "draft" | "published";
  file_key: string;
  file_name: string;
  content_type: string;
  size_bytes: number;
  uploaded_by: string;
  created_at: number;
  updated_at: number;
};

type RuntimeEnv = { DB: D1Database; FILES: R2Bucket };
const runtime = env as unknown as RuntimeEnv;

export function getResourceBindings() {
  if (!runtime.DB || !runtime.FILES) throw new Error("Resource storage is unavailable.");
  return runtime;
}

export async function ensureResourceSchema() {
  const { DB } = getResourceBindings();
  await DB.batch([
    DB.prepare(`CREATE TABLE IF NOT EXISTS resources (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL,
      language TEXT NOT NULL,
      access_level TEXT NOT NULL DEFAULT 'public',
      status TEXT NOT NULL DEFAULT 'draft',
      file_key TEXT NOT NULL UNIQUE,
      file_name TEXT NOT NULL,
      content_type TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      uploaded_by TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )`),
    DB.prepare("CREATE INDEX IF NOT EXISTS idx_resources_status_created ON resources(status, created_at)"),
  ]);
}

export const requireAdmin = requirePasswordAdmin;

export function publicResource(row: ResourceRow) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    language: row.language,
    accessLevel: row.access_level,
    fileName: row.file_name,
    contentType: row.content_type,
    sizeBytes: row.size_bytes,
    createdAt: row.created_at,
    downloadUrl: row.access_level === "public" ? `/api/resources/${row.id}/file` : null,
  };
}
