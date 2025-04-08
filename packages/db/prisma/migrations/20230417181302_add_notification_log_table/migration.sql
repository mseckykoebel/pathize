-- CreateTable
CREATE TABLE `notification_logs` (
    `id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `latest_webhook_update` DATETIME(3) NOT NULL,
    `notification_option` ENUM('MAXHR', 'MINHR') NOT NULL,
    `value` INTEGER NULL,
    `user_id` VARCHAR(191) NOT NULL,

    INDEX `notification_logs_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
