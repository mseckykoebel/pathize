-- CreateTable
CREATE TABLE `sleep_data` (
    `id` VARCHAR(191) NOT NULL,
    `date` VARCHAR(191) NOT NULL,
    `terra_user_id` VARCHAR(191) NOT NULL,
    `resource` ENUM('FITBIT', 'GARMIN', 'GOOGLE', 'POLAR', 'APPLE') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `latest_webhook_update` DATETIME(3) NULL,
    `user_id` VARCHAR(191) NOT NULL,

    INDEX `sleep_data_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
