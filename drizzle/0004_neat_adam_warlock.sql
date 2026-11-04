CREATE TABLE `stripe_events` (
	`id` varchar(255) NOT NULL,
	`type` varchar(120) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stripe_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `assessments` ADD `paymentStatus` enum('pending','paid','failed') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `assessments` ADD `stripeCheckoutSessionId` varchar(255);--> statement-breakpoint
ALTER TABLE `assessments` ADD `stripePaymentIntentId` varchar(255);--> statement-breakpoint
ALTER TABLE `assessments` ADD `paidAt` timestamp;