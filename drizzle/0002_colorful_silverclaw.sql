CREATE TABLE `contact_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`message` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_contact_submissions_created` ON `contact_submissions` (`created_at`);--> statement-breakpoint
ALTER TABLE `resources` ADD `resource_kind` text DEFAULT 'study' NOT NULL;--> statement-breakpoint
ALTER TABLE `resources` ADD `school_name` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `resources` ADD `faculty` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `resources` ADD `exam_year` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `resources` ADD `subject` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `resources` ADD `price_yen` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `resources` ADD `purchase_url` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `resources` ADD `preview_key` text;--> statement-breakpoint
ALTER TABLE `resources` ADD `preview_name` text;--> statement-breakpoint
ALTER TABLE `resources` ADD `preview_content_type` text;--> statement-breakpoint
ALTER TABLE `resources` ADD `preview_size_bytes` integer DEFAULT 0 NOT NULL;