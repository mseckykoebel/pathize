-- CreateTable
CREATE TABLE `clinical_surveys` (
    `id` VARCHAR(191) NOT NULL,
    `medical_problems_have_prevented_me_from_accomplishing_goals` INTEGER NOT NULL,
    `completely_overwhelmed_by_medical_problems` INTEGER NOT NULL,
    `level_of_pain` INTEGER NOT NULL,
    `level_of_energy` INTEGER NOT NULL,
    `quality_of_sleep` INTEGER NOT NULL,
    `level_of_memory_problems` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `user_id` VARCHAR(191) NOT NULL,

    INDEX `clinical_surveys_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
