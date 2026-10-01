CREATE TABLE `images` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`title` text NOT NULL,
	`mime` text NOT NULL,
	`object_key` text NOT NULL,
	`deleted` integer DEFAULT 0 NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `images_owner` ON `images` (`owner`);--> statement-breakpoint
CREATE TABLE `items` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`url` text,
	`note` text DEFAULT '' NOT NULL,
	`done` integer DEFAULT 0 NOT NULL,
	`deleted` integer DEFAULT 0 NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `items_owner_kind` ON `items` (`owner`,`kind`);