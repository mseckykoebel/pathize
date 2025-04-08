/*
  Warnings:

  - You are about to drop the `CheckInMedication` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CheckInSymptom` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `CheckInMedication`;

-- DropTable
DROP TABLE `CheckInSymptom`;

-- CreateTable
CREATE TABLE `check_in_medications` (
    `check_in_id` VARCHAR(191) NOT NULL,
    `user_medication_id` VARCHAR(191) NOT NULL,

    INDEX `check_in_medications_check_in_id_idx`(`check_in_id`),
    INDEX `check_in_medications_user_medication_id_idx`(`user_medication_id`),
    PRIMARY KEY (`check_in_id`, `user_medication_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `check_in_symptoms` (
    `check_in_id` VARCHAR(191) NOT NULL,
    `user_symptom_id` VARCHAR(191) NOT NULL,

    INDEX `check_in_symptoms_check_in_id_idx`(`check_in_id`),
    INDEX `check_in_symptoms_user_symptom_id_idx`(`user_symptom_id`),
    PRIMARY KEY (`check_in_id`, `user_symptom_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
