-- CreateTable
CREATE TABLE `notification_preferences` (
    `id` VARCHAR(191) NOT NULL,
    `preference` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `max_hr_enabled` BOOLEAN NOT NULL DEFAULT false,
    `max_hr_value` INTEGER NULL,
    `min_hr_enabled` BOOLEAN NOT NULL DEFAULT false,
    `min_hr_value` INTEGER NULL,
    `user_id` VARCHAR(191) NOT NULL,

    INDEX `notification_preferences_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
