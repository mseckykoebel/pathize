/*
  Warnings:

  - You are about to alter the column `rest_seconds` on the `daily_data` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `active_seconds` on the `daily_data` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `low_intensity_seconds` on the `daily_data` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `max_hr_bpm` on the `daily_data` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `min_hr_bpm` on the `daily_data` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `resting_hr_bpm` on the `daily_data` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `user_max_hr_bpm` on the `daily_data` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `daily_data` MODIFY `rest_seconds` DOUBLE NULL,
    MODIFY `active_seconds` DOUBLE NULL,
    MODIFY `low_intensity_seconds` DOUBLE NULL,
    MODIFY `max_hr_bpm` DOUBLE NULL,
    MODIFY `min_hr_bpm` DOUBLE NULL,
    MODIFY `resting_hr_bpm` DOUBLE NULL,
    MODIFY `user_max_hr_bpm` DOUBLE NULL;
