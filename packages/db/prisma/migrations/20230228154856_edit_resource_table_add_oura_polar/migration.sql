-- AlterTable
ALTER TABLE `daily_data` MODIFY `resource` ENUM('FITBIT', 'GARMIN', 'GOOGLE', 'OURA', 'POLAR', 'APPLE') NOT NULL;

-- AlterTable
ALTER TABLE `device_connections` MODIFY `resource` ENUM('FITBIT', 'GARMIN', 'GOOGLE', 'OURA', 'POLAR', 'APPLE') NOT NULL;
