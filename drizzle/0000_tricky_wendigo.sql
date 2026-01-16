CREATE TABLE `users` (
	`id` varchar(255) NOT NULL,
	`email` varchar(255),
	`mediawiki_username` varchar(255),
	`name` varchar(255),
	`email_verified` boolean NOT NULL DEFAULT false,
	`email_verified_at` timestamp,
	`mediawiki_username_verified_at` timestamp,
	`image` varchar(255),
	`timezone` varchar(100) DEFAULT 'UTC',
	`password` varchar(255),
	`bio` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`),
	CONSTRAINT `users_mediawiki_username_unique` UNIQUE(`mediawiki_username`)
);
--> statement-breakpoint
CREATE TABLE `accounts` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`account_id` varchar(255) NOT NULL,
	`provider_id` varchar(255) NOT NULL,
	`type` varchar(255),
	`provider` varchar(255),
	`provider_account_id` varchar(255),
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` timestamp(3),
	`refresh_token_expires_at` timestamp(3),
	`scope` text,
	`password` text,
	`google_refresh_token` text,
	`google_access_token` text,
	`google_expires_at` int,
	`google_token_type` varchar(255),
	`google_scope` varchar(255),
	`google_id_token` text,
	`google_session_state` varchar(255),
	`mediawiki_access_token` text,
	`mediawiki_expires_at` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_provider_account` UNIQUE(`provider_id`,`account_id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`token` varchar(255) NOT NULL,
	`expires_at` timestamp(3) NOT NULL,
	`ip_address` varchar(255),
	`user_agent` text,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	`provider` varchar(255),
	`provider_identifier` varchar(255),
	`session_token` varchar(255),
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `sessions_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `verification_tokens` (
	`id` varchar(255) NOT NULL,
	`identifier` varchar(255) NOT NULL,
	`value` text NOT NULL,
	`expires_at` timestamp(3) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `verification_tokens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `accounts` ADD CONSTRAINT `accounts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification_tokens` (`identifier`);