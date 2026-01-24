CREATE TABLE `community_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`community_id` int NOT NULL,
	`role` varchar(50) NOT NULL DEFAULT 'member',
	`joined_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `community_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `community_members` ADD CONSTRAINT `community_members_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `community_members` ADD CONSTRAINT `community_members_community_id_communities_id_fk` FOREIGN KEY (`community_id`) REFERENCES `communities`(`id`) ON DELETE cascade ON UPDATE no action;