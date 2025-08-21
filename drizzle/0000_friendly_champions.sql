CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`fullname` text NOT NULL,
	`passwd` text NOT NULL,
	`avatar_url` text ,
	`created_at` integer DEFAULT '"2025-08-21T04:20:00.000Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2025-08-21T04:20:00.000Z"' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);
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
	`title` text NOT NULL,
	`system_message` text DEFAULT '',
	`enable_system_message` numeric DEFAULT '1',
	`user_id` integer DEFAULT '1',
	`folder_id` text,
	`created_at` integer DEFAULT '"2025-08-10T09:07:31.447Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2025-08-10T09:07:31.447Z"' NOT NULL,
	FOREIGN KEY (`folder_id`) REFERENCES `folders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `folders` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer DEFAULT '"2025-08-10T09:07:31.446Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2025-08-10T09:07:31.446Z"' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `message_group_messages` (
	`message_id` text NOT NULL,
	`message_group_id` text NOT NULL,
	PRIMARY KEY(`message_group_id`, `message_id`),
	FOREIGN KEY (`message_id`) REFERENCES `messages`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`message_group_id`) REFERENCES `message_groups`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `message_groups` (
	`id` text PRIMARY KEY NOT NULL,
	`conversation_id` text NOT NULL,
	`created_at` integer DEFAULT '"2025-08-10T09:07:31.447Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2025-08-10T09:07:31.447Z"' NOT NULL,
	FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`conversation_id` text NOT NULL,
	`participant_id` integer NOT NULL,
	`content` text NOT NULL,
	`parent_id` text,
	`collapsed` numeric DEFAULT '0',
	`has_error` numeric DEFAULT '0',
	`reasoning_content` text ,
	`created_at` integer DEFAULT '"2025-08-10T09:07:31.447Z"' NOT NULL,
	FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`participant_id`) REFERENCES `participants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `participants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`created_at` integer DEFAULT '"2025-08-10T09:07:31.446Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2025-08-10T09:07:31.446Z"' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `attachments` (
	`id` text PRIMARY KEY NOT NULL,
	`filename` text NOT NULL,
	`mimetype` text NOT NULL,
	`created_at` integer DEFAULT '"2025-08-19T03:57:43.423Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2025-08-19T03:57:43.423Z"' NOT NULL
);
--> statement-breakpoint

CREATE UNIQUE INDEX `participants_username_unique` ON `participants` (`username`);