/*
  Warnings:

  - You are about to drop the `sdk_connections` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `sdk_connections`;

-- CreateTable
CREATE TABLE `daily_data` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `step_samples` JSON NULL,
    `distance` DOUBLE NULL,
    `total_calories` DOUBLE NULL,
    `rest_seconds` INTEGER NULL,
    `active_seconds` INTEGER NULL,
    `low_intensity_seconds` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `device_id` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `daily_data_date_key`(`date`),
    INDEX `daily_data_device_id_idx`(`device_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
