ALTER TABLE `users` RENAME COLUMN `name` TO `first_name`;--> statement-breakpoint
ALTER TABLE `messages` ADD `is_reply` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `messages` ADD `attachment_type` text;--> statement-breakpoint
ALTER TABLE `people` ADD `is_contact` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `last_name` text NOT NULL;