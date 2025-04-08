/*
  Warnings:

  - You are about to drop the `notification_preferences` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `notification_preferences`;

-- CreateTable
CREATE TABLE `notifications` (
    `id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `option` ENUM('MAXHR', 'MINHR') NOT NULL,
    `value` INTEGER NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT false,
    `user_id` VARCHAR(191) NOT NULL,

    INDEX `notifications_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
