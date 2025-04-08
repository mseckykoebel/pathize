-- AlterTable
ALTER TABLE `device_connections` MODIFY `resource` ENUM('FITBIT', 'GARMIN', 'GOOGLE', 'APPLE') NOT NULL;
