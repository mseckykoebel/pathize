/*
  Warnings:

  - You are about to drop the `conditions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `conditions`;

-- CreateTable
CREATE TABLE `illnesses` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `infection_date` DATETIME(3) NULL,
    `user_id` VARCHAR(191) NOT NULL,

    INDEX `illnesses_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
