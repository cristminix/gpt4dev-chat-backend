CREATE TABLE `conversation_members` (
	`conversation_id` text NOT NULL,
	`participant_id` integer NOT NULL,
	PRIMARY KEY(`conversation_id`, `participant_id`),
	FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`participant_id`) REFERENCES `participants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT '"2025-07-31T04:54:08.466Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2025-07-31T04:54:08.466Z"' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`conversation_id` text NOT NULL,
	`participant_id` integer NOT NULL,
	`content` text NOT NULL,
	`created_at` integer DEFAULT '"2025-07-31T04:54:08.466Z"' NOT NULL,
	FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`participant_id`) REFERENCES `participants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `participants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`created_at` integer DEFAULT '"2025-07-31T04:54:08.465Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2025-07-31T04:54:08.465Z"' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `participants_username_unique` ON `participants` (`username`);