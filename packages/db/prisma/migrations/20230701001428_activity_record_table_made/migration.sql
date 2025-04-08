-- CreateTable
CREATE TABLE `activities` (
    `id` VARCHAR(191) NOT NULL,
    `activity_icon` VARCHAR(191) NOT NULL,
    `activity_name` VARCHAR(191) NOT NULL,
    `activity_priority` INTEGER NULL,
    `created_day` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `time` VARCHAR(191) NOT NULL,
    `notes` LONGTEXT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `user_activity_id` VARCHAR(191) NOT NULL,

    INDEX `activities_user_id_idx`(`user_id`),
    INDEX `activities_user_activity_id_idx`(`user_activity_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
