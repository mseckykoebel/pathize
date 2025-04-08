-- CreateTable
CREATE TABLE `user_medications` (
    `id` VARCHAR(191) NOT NULL,
    `medication_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `notes` LONGTEXT NULL,
    `user_id` VARCHAR(191) NOT NULL,

    INDEX `user_medications_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
