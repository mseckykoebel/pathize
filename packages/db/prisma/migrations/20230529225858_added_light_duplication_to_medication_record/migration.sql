-- AlterTable
ALTER TABLE `medications` ADD COLUMN `strength` DOUBLE NULL,
    ADD COLUMN `type` VARCHAR(191) NULL,
    ADD COLUMN `unit` VARCHAR(191) NULL;
