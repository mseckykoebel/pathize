-- AlterTable
ALTER TABLE `user_medications` ADD COLUMN `medication_name` VARCHAR(191) NULL,
    MODIFY `medication_id` VARCHAR(191) NULL;
