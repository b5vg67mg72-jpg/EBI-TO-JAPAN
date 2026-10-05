import { env } from "cloudflare:workers";
import { requirePasswordAdmin } from "./admin-session";

export type ResourceRow = {
  id: string;
  title: string;
  description: string;
  category: string;
  language: string;
  access_level: "public" | "group" | "paid";
  resource_kind: "study" | "exam";
  school_name: string;
  faculty: string;
  exam_year: string;
  subject: string;
  price_yen: number;
  purchase_url: string;
  preview_key: string | null;
  preview_name: string | null;
  preview_content_type: string | null;
  preview_size_bytes: number;
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
  await DB.prepare(`CREATE TABLE IF NOT EXISTS resources (
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
    )`).run();

  const columns = await DB.prepare("PRAGMA table_info(resources)").all<{ name: string }>();
  const existing = new Set(columns.results.map(column => column.name));
  const additions = [
    ["resource_kind", "TEXT NOT NULL DEFAULT 'study'"],
    ["school_name", "TEXT NOT NULL DEFAULT ''"],
    ["faculty", "TEXT NOT NULL DEFAULT ''"],
    ["exam_year", "TEXT NOT NULL DEFAULT ''"],
    ["subject", "TEXT NOT NULL DEFAULT ''"],
    ["price_yen", "INTEGER NOT NULL DEFAULT 0"],
    ["purchase_url", "TEXT NOT NULL DEFAULT ''"],
    ["preview_key", "TEXT"],
    ["preview_name", "TEXT"],
    ["preview_content_type", "TEXT"],
    ["preview_size_bytes", "INTEGER NOT NULL DEFAULT 0"],
  ] as const;
  for (const [name, definition] of additions) {
    if (!existing.has(name)) await DB.prepare(`ALTER TABLE resources ADD COLUMN ${name} ${definition}`).run();
  }
  await DB.batch([
    DB.prepare("CREATE INDEX IF NOT EXISTS idx_resources_status_created ON resources(status, created_at)"),
    DB.prepare("CREATE INDEX IF NOT EXISTS idx_resources_kind_status ON resources(resource_kind, status, created_at)"),
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
    resourceKind: row.resource_kind || "study",
    schoolName: row.school_name || "",
    faculty: row.faculty || "",
    examYear: row.exam_year || "",
    subject: row.subject || "",
    priceYen: row.price_yen || 0,
    purchaseUrl: row.purchase_url || null,
    previewUrl: row.preview_key ? `/api/resources/${row.id}/preview` : null,
    fileName: row.file_name,
    contentType: row.content_type,
    sizeBytes: row.size_bytes,
    createdAt: row.created_at,
    downloadUrl: row.resource_kind !== "exam" && row.access_level === "public" ? `/api/resources/${row.id}/file` : null,
  };
}
