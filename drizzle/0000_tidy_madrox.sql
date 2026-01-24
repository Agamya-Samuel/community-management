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
	`email_skipped_at` timestamp,
	`role` varchar(50) NOT NULL DEFAULT 'user',
	`user_type` varchar(50) NOT NULL DEFAULT 'registered_user',
	`subscription_id` varchar(255),
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
CREATE TABLE `payment_transactions` (
	`transaction_id` varchar(255) NOT NULL,
	`subscription_id` varchar(255),
	`gateway_transaction_id` varchar(255),
	`payment_gateway` varchar(50) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(3) NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`payment_method` varchar(50),
	`gateway_response` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `payment_transactions_transaction_id` PRIMARY KEY(`transaction_id`)
);
--> statement-breakpoint
CREATE TABLE `subscription_requests` (
	`request_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`wikimedia_username` varchar(255),
	`wikimedia_profile_url` varchar(500),
	`years_active` int,
	`contribution_type` varchar(50),
	`purpose_statement` text,
	`edit_count` int,
	`contributions_url` varchar(500),
	`notable_projects` text,
	`alternative_email` varchar(255),
	`phone_number` varchar(20),
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`submitted_at` timestamp NOT NULL DEFAULT (now()),
	`reviewed_at` timestamp,
	`reviewed_by` varchar(255),
	`admin_notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `subscription_requests_request_id` PRIMARY KEY(`request_id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`subscription_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`plan_type` varchar(50) NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`payment_gateway` varchar(50),
	`start_date` timestamp NOT NULL,
	`end_date` timestamp,
	`amount_paid` decimal(10,2),
	`currency` varchar(3),
	`transaction_id` varchar(255),
	`auto_renew` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `subscriptions_subscription_id` PRIMARY KEY(`subscription_id`)
);
--> statement-breakpoint
CREATE TABLE `communities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`photo` varchar(500),
	`parent_community_id` int,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `communities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `community_admins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`community_id` int NOT NULL,
	`role` varchar(50) NOT NULL DEFAULT 'owner',
	`assigned_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `community_admins_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `event_registrations` (
	`registration_id` varchar(255) NOT NULL,
	`event_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`community_id` int NOT NULL,
	`joined_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`status` varchar(50) NOT NULL DEFAULT 'confirmed',
	`guest_count` int DEFAULT 0,
	`registered_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`cancelled_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `event_registrations_registration_id` PRIMARY KEY(`registration_id`)
);
--> statement-breakpoint
CREATE TABLE `event_tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`event_id` varchar(255) NOT NULL,
	`tag` varchar(100) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `event_tags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`event_id` varchar(255) NOT NULL,
	`event_type` varchar(50) NOT NULL,
	`title` varchar(100) NOT NULL,
	`short_description` varchar(200),
	`full_description` text,
	`category_id` varchar(255),
	`language` varchar(10) DEFAULT 'en',
	`start_datetime` timestamp NOT NULL,
	`end_datetime` timestamp NOT NULL,
	`timezone` varchar(50) DEFAULT 'UTC',
	`registration_type` varchar(20) NOT NULL DEFAULT 'free',
	`capacity` int,
	`status` varchar(50) NOT NULL DEFAULT 'draft',
	`primary_organizer_id` varchar(255) NOT NULL,
	`community_id` int,
	`contact_email` varchar(255) NOT NULL,
	`contact_phone` varchar(20),
	`banner_url` varchar(500),
	`thumbnail_url` varchar(500),
	`slug` varchar(200),
	`accessibility_features` text,
	`doors_open_time` varchar(10),
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`published_at` timestamp,
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `events_event_id` PRIMARY KEY(`event_id`),
	CONSTRAINT `events_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `online_event_metadata` (
	`metadata_id` varchar(255) NOT NULL,
	`event_id` varchar(255) NOT NULL,
	`platform_type` varchar(50),
	`meeting_link` varchar(500),
	`meeting_id` varchar(100),
	`passcode` varchar(50),
	`access_control` varchar(50),
	`waiting_room_enabled` boolean DEFAULT false,
	`max_participants` int,
	`recording_enabled` boolean DEFAULT false,
	`recording_availability` varchar(50),
	`recording_url` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `online_event_metadata_metadata_id` PRIMARY KEY(`metadata_id`)
);
--> statement-breakpoint
CREATE TABLE `onsite_event_metadata` (
	`metadata_id` varchar(255) NOT NULL,
	`event_id` varchar(255) NOT NULL,
	`venue_name` varchar(100),
	`venue_type` varchar(50),
	`address_line1` varchar(200),
	`address_line2` varchar(200),
	`city` varchar(100),
	`state` varchar(100),
	`postal_code` varchar(20),
	`country` varchar(50),
	`room_name` varchar(100),
	`floor_number` varchar(20),
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`google_maps_link` varchar(500),
	`landmark` varchar(100),
	`parking_available` boolean DEFAULT false,
	`parking_instructions` text,
	`public_transport` text,
	`venue_capacity` int,
	`seating_arrangement` varchar(50),
	`check_in_required` boolean DEFAULT false,
	`check_in_method` varchar(50),
	`id_verification` boolean DEFAULT false,
	`age_restriction` varchar(20),
	`minimum_age` int,
	`dress_code` varchar(50),
	`items_not_allowed` text,
	`first_aid_available` boolean DEFAULT false,
	`emergency_contact` varchar(20),
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `onsite_event_metadata_metadata_id` PRIMARY KEY(`metadata_id`)
);
--> statement-breakpoint
ALTER TABLE `accounts` ADD CONSTRAINT `accounts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payment_transactions` ADD CONSTRAINT `payment_transactions_subscription_id_fk` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`subscription_id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscription_requests` ADD CONSTRAINT `subscription_requests_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscription_requests` ADD CONSTRAINT `subscription_requests_reviewed_by_users_id_fk` FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `event_registrations` ADD CONSTRAINT `event_registrations_event_id_events_event_id_fk` FOREIGN KEY (`event_id`) REFERENCES `events`(`event_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `event_registrations` ADD CONSTRAINT `event_registrations_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `event_registrations` ADD CONSTRAINT `event_registrations_community_id_communities_id_fk` FOREIGN KEY (`community_id`) REFERENCES `communities`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `event_tags` ADD CONSTRAINT `event_tags_event_id_events_event_id_fk` FOREIGN KEY (`event_id`) REFERENCES `events`(`event_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `events` ADD CONSTRAINT `events_primary_organizer_id_users_id_fk` FOREIGN KEY (`primary_organizer_id`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `events` ADD CONSTRAINT `events_community_id_communities_id_fk` FOREIGN KEY (`community_id`) REFERENCES `communities`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `online_event_metadata` ADD CONSTRAINT `online_event_metadata_event_id_events_event_id_fk` FOREIGN KEY (`event_id`) REFERENCES `events`(`event_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `onsite_event_metadata` ADD CONSTRAINT `onsite_event_metadata_event_id_events_event_id_fk` FOREIGN KEY (`event_id`) REFERENCES `events`(`event_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification_tokens` (`identifier`);