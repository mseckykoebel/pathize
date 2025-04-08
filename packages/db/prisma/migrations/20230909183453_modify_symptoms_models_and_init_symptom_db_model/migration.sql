-- AlterTable
ALTER TABLE `symptoms` ADD COLUMN `user_symptom_id` VARCHAR(191) NULL,
    MODIFY `symptom_id` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `symptom_db` (
    `id` VARCHAR(191) NOT NULL,
    `symptom_id` VARCHAR(191) NULL,
    `symptom_name` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `symptoms_user_symptom_id_idx` ON `symptoms`(`user_symptom_id`);
