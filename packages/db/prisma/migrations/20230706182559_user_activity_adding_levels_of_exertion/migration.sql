-- AlterTable
ALTER TABLE `activities` ADD COLUMN `activity_cognitive_exertion` INTEGER NULL,
    ADD COLUMN `activity_emotional_exertion` INTEGER NULL,
    ADD COLUMN `activity_physical_exertion` INTEGER NULL;
