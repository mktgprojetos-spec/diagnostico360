ALTER TABLE `companies` MODIFY COLUMN `stage` varchar(100);--> statement-breakpoint
ALTER TABLE `companies` MODIFY COLUMN `challenge` text;--> statement-breakpoint
ALTER TABLE `assessments` ADD `contextMoments` text;--> statement-breakpoint
ALTER TABLE `assessments` ADD `contextChallenge` text;--> statement-breakpoint
ALTER TABLE `assessments` ADD `contextExpectation` text;