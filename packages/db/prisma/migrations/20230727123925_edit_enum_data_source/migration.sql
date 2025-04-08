-- AlterTable
ALTER TABLE `daily_data` MODIFY `resource` ENUM('FITBIT', 'GARMIN', 'GOOGLE', 'POLAR', 'APPLE', 'OURA') NOT NULL;

-- AlterTable
ALTER TABLE `device_connections` MODIFY `resource` ENUM('FITBIT', 'GARMIN', 'GOOGLE', 'POLAR', 'APPLE', 'OURA') NOT NULL;

-- AlterTable
ALTER TABLE `sleep_data` MODIFY `resource` ENUM('FITBIT', 'GARMIN', 'GOOGLE', 'POLAR', 'APPLE', 'OURA') NOT NULL;
