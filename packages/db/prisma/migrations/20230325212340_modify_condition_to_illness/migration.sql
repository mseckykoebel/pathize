-- CreateTable
CREATE TABLE `insights` (
    `id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `avg_seven_day_above_baseline` DOUBLE NULL,
    `user_id` VARCHAR(191) NOT NULL,

    INDEX `insights_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
