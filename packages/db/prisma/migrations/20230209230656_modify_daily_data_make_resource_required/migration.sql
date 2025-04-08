/*
  Warnings:

  - Made the column `resource` on table `daily_data` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `daily_data` MODIFY `resource` ENUM('FITBIT', 'GARMIN', 'GOOGLE', 'APPLE') NOT NULL;
