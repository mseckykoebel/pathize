/*
  Warnings:

  - You are about to alter the column `avg_hr_bpm` on the `daily_data` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `avg_hrv_rmssd` on the `daily_data` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `avg_hrv_sdnn` on the `daily_data` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `daily_data` MODIFY `avg_hr_bpm` DOUBLE NULL,
    MODIFY `avg_hrv_rmssd` DOUBLE NULL,
    MODIFY `avg_hrv_sdnn` DOUBLE NULL;
