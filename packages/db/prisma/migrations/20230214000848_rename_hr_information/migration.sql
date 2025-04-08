/*
  Warnings:

  - You are about to drop the column `heart_rate_variability_samples_rmssd` on the `daily_data` table. All the data in the column will be lost.
  - You are about to drop the column `heart_rate_variability_samples_sdnn` on the `daily_data` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `daily_data` DROP COLUMN `heart_rate_variability_samples_rmssd`,
    DROP COLUMN `heart_rate_variability_samples_sdnn`,
    ADD COLUMN `heart_rate_variance_samples_rmssd` JSON NULL,
    ADD COLUMN `heart_rate_variance_samples_sdnn` JSON NULL;
