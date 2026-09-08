PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` integer PRIMARY KEY,
	`first_name` text,
	`last_name` text,
	`onboarding_step` text DEFAULT 'welcome' NOT NULL,
	`has_completed_onboarding` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`(`id`, `first_name`, `last_name`, `onboarding_step`, `has_completed_onboarding`) SELECT `id`, `first_name`, `last_name`, `onboarding_step`, `has_completed_onboarding` FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;