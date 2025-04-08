-- CreateTable
CREATE TABLE `medication_records` (
    `id` VARCHAR(191) NOT NULL,
    `medication_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `time` VARCHAR(191) NOT NULL,
    `notes` LONGTEXT NULL,
    `user_medication_id` VARCHAR(191) NULL,
    `user_id` VARCHAR(191) NOT NULL,

    INDEX `medication_records_user_id_idx`(`user_id`),
    INDEX `medication_records_user_medication_id_idx`(`user_medication_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
