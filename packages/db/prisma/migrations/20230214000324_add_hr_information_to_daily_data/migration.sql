-- AlterTable
ALTER TABLE `daily_data` ADD COLUMN `heart_rate_samples` JSON NULL,
    ADD COLUMN `heart_rate_variability_samples_rmssd` JSON NULL,
    ADD COLUMN `heart_rate_variability_samples_sdnn` JSON NULL;
