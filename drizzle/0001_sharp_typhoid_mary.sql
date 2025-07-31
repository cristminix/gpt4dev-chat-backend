CREATE TABLE `conversations_new` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
INSERT INTO `conversations_new` (`id`, `title`, `created_at`, `updated_at`) 
SELECT `id`, `title`, `created_at`, `updated_at` FROM `conversations`;
--> statement-breakpoint
DROP TABLE `conversations`;
--> statement-breakpoint
ALTER TABLE `conversations_new` RENAME TO `conversations`;