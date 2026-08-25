CREATE TABLE `users` (
	`id` integer PRIMARY KEY,
	`name` text NOT NULL,
	`has_completed_onboarding` integer DEFAULT false NOT NULL
);
