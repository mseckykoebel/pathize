/*
  Warnings:

  - You are about to drop the column `max_hr_enabled` on the `notification_preferences` table. All the data in the column will be lost.
  - You are about to drop the column `max_hr_value` on the `notification_preferences` table. All the data in the column will be lost.
  - You are about to drop the column `min_hr_enabled` on the `notification_preferences` table. All the data in the column will be lost.
  - You are about to drop the column `min_hr_value` on the `notification_preferences` table. All the data in the column will be lost.
  - Added the required column `preference` to the `notification_preferences` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `notification_preferences` DROP COLUMN `max_hr_enabled`,
    DROP COLUMN `max_hr_value`,
    DROP COLUMN `min_hr_enabled`,
    DROP COLUMN `min_hr_value`,
    ADD COLUMN `enabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `preference` ENUM('MAXHR', 'MINHR') NOT NULL,
    ADD COLUMN `value` INTEGER NULL;
