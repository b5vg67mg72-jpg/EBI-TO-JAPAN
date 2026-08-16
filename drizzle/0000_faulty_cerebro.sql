CREATE TABLE `resources` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`category` text NOT NULL,
	`language` text NOT NULL,
	`access_level` text DEFAULT 'public' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`file_key` text NOT NULL,
	`file_name` text NOT NULL,
	`content_type` text NOT NULL,
	`size_bytes` integer NOT NULL,
	`uploaded_by` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `resources_file_key_unique` ON `resources` (`file_key`);