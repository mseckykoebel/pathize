/*
  Warnings:

  - Made the column `user_id` on table `promotions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `user_id` on table `referral_codes` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `promotions` MODIFY `user_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `referral_codes` MODIFY `user_id` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `check_ins` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `notifications_enabled` BOOLEAN NOT NULL DEFAULT true,
    `time` DATETIME(3) NOT NULL,

    INDEX `check_ins_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CheckInMedication` (
    `check_in_id` VARCHAR(191) NOT NULL,
    `user_medication_id` VARCHAR(191) NOT NULL,

    INDEX `CheckInMedication_check_in_id_idx`(`check_in_id`),
    INDEX `CheckInMedication_user_medication_id_idx`(`user_medication_id`),
    PRIMARY KEY (`check_in_id`, `user_medication_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CheckInSymptom` (
    `check_in_id` VARCHAR(191) NOT NULL,
    `user_symptom_id` VARCHAR(191) NOT NULL,

    INDEX `CheckInSymptom_check_in_id_idx`(`check_in_id`),
    INDEX `CheckInSymptom_user_symptom_id_idx`(`user_symptom_id`),
    PRIMARY KEY (`check_in_id`, `user_symptom_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
