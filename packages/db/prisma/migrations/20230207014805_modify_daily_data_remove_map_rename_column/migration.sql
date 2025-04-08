/*
  Warnings:

  - You are about to drop the column `device_resource` on the `daily_data` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `daily_data` DROP COLUMN `device_resource`,
    ADD COLUMN `resource` ENUM('FITBIT', 'GARMIN', 'GOOGLE', 'APPLE') NULL;
