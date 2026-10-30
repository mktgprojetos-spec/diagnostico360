CREATE TABLE `assessment_answers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assessmentId` int NOT NULL,
	`questionId` varchar(8) NOT NULL,
	`value` int,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assessment_answers_id` PRIMARY KEY(`id`),
	CONSTRAINT `assessment_question_unique` UNIQUE(`assessmentId`,`questionId`)
);
--> statement-breakpoint
CREATE TABLE `assessment_reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assessmentId` int NOT NULL,
	`reviewerId` int NOT NULL,
	`status` enum('needs_review','approved') NOT NULL,
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `assessment_reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `assessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`companyId` int NOT NULL,
	`version` varchar(24) NOT NULL,
	`status` enum('draft','submitted','in_review','approved') NOT NULL DEFAULT 'draft',
	`currentStep` int NOT NULL DEFAULT 0,
	`overallScore` int,
	`confidence` enum('high','moderate','low'),
	`submittedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assessments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `companies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(180) NOT NULL,
	`sector` varchar(160) NOT NULL,
	`size` varchar(80) NOT NULL,
	`stage` varchar(100) NOT NULL,
	`challenge` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `companies_id` PRIMARY KEY(`id`)
);
