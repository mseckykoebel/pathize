/*
  Warnings:

  - You are about to drop the `medication_records` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `medication_records`;

-- CreateTable
CREATE TABLE `medications` (
    `id` VARCHAR(191) NOT NULL,
    `medication_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `time` VARCHAR(191) NOT NULL,
    `notes` LONGTEXT NULL,
    `user_medication_id` VARCHAR(191) NULL,
    `user_id` VARCHAR(191) NOT NULL,

    INDEX `medications_user_id_idx`(`user_id`),
    INDEX `medications_user_medication_id_idx`(`user_medication_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
