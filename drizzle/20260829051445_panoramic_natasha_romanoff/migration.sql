CREATE TABLE `ingestion_state` (
	`id` integer PRIMARY KEY,
	`last_row_id` integer DEFAULT 0 NOT NULL
);
