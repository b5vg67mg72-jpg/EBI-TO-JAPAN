import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const resources = sqliteTable("resources", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  category: text("category").notNull(),
  language: text("language").notNull(),
  accessLevel: text("access_level").notNull().default("public"),
  status: text("status").notNull().default("draft"),
  fileKey: text("file_key").notNull().unique(),
  fileName: text("file_name").notNull(),
  contentType: text("content_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  uploadedBy: text("uploaded_by").notNull(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
}, (table) => [index("idx_resources_status_created").on(table.status, table.createdAt)]);
