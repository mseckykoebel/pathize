/*
  Warnings:

  - The values [OURA] on the enum `daily_data_resource` will be removed. If these variants are still used in the database, this will fail.
  - The values [OURA] on the enum `daily_data_resource` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `daily_data` MODIFY `resource` ENUM('FITBIT', 'GARMIN', 'GOOGLE', 'POLAR', 'APPLE') NOT NULL;

-- AlterTable
ALTER TABLE `device_connections` MODIFY `resource` ENUM('FITBIT', 'GARMIN', 'GOOGLE', 'POLAR', 'APPLE') NOT NULL;
