-- CreateTable
CREATE TABLE `symptoms` (
    `id` VARCHAR(191) NOT NULL,
    `created_day` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `time` VARCHAR(191) NULL,
    `symptom_id` VARCHAR(191) NOT NULL,
    `symptom_severity` INTEGER NULL,
    `user_id` VARCHAR(191) NOT NULL,

    INDEX `symptoms_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
