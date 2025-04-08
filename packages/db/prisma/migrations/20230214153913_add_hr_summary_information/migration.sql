-- AlterTable
ALTER TABLE `daily_data` ADD COLUMN `avg_hr_bpm` INTEGER NULL,
    ADD COLUMN `avg_hrv_rmssd` INTEGER NULL,
    ADD COLUMN `avg_hrv_sdnn` INTEGER NULL,
    ADD COLUMN `max_hr_bpm` INTEGER NULL,
    ADD COLUMN `min_hr_bpm` INTEGER NULL,
    ADD COLUMN `resting_hr_bpm` INTEGER NULL,
    ADD COLUMN `user_max_hr_bpm` INTEGER NULL;
