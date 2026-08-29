CREATE TABLE `messages` (
	`id` integer PRIMARY KEY,
	`guid` text NOT NULL UNIQUE,
	`person_id` integer NOT NULL,
	`chat_id` integer NOT NULL,
	`is_from_me` integer NOT NULL,
	`message_content` text NOT NULL,
	`sent_at` integer NOT NULL,
	CONSTRAINT `fk_messages_person_id_people_id_fk` FOREIGN KEY (`person_id`) REFERENCES `people`(`id`)
);
--> statement-breakpoint
CREATE TABLE `people` (
	`id` integer PRIMARY KEY,
	`handle` text NOT NULL UNIQUE,
	`first_name` text,
	`middle_name` text,
	`last_name` text,
	`nickname` text,
	`contact_image` blob,
	`birthday` text,
	`job_title` text
);
