-- AlterTable
ALTER TABLE `daily_data` ADD COLUMN `device_resource` ENUM('FITBIT', 'GARMIN', 'GOOGLE', 'APPLE') NULL;
