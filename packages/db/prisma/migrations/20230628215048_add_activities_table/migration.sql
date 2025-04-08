-- CreateTable
CREATE TABLE `user_activities` (
    `id` VARCHAR(191) NOT NULL,
    `activity_id` VARCHAR(191) NULL,
    `activity_icon` VARCHAR(191) NULL,
    `activity_name` VARCHAR(191) NULL,
    `activity_priority` INTEGER NULL,
    `notes` LONGTEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `user_id` VARCHAR(191) NOT NULL,

    INDEX `user_activities_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
