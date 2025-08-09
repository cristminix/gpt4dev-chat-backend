ALTER TABLE `conversations` ADD `system_message` text DEFAULT '';--> statement-breakpoint
ALTER TABLE `conversations` ADD `enable_system_message` numeric DEFAULT '1';--> statement-breakpoint
ALTER TABLE `messages` ADD `collapsed` numeric DEFAULT '0';