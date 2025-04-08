/*
  Warnings:

  - You are about to drop the column `time_in_minutes` on the `notification_logs` table. All the data in the column will be lost.
  - The values [HR_LIMIT_PERCENT] on the enum `notification_logs_notification_option` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `time_in_minutes` on the `notifications` table. All the data in the column will be lost.
  - The values [HR_LIMIT_PERCENT] on the enum `notification_logs_notification_option` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `notification_logs` DROP COLUMN `time_in_minutes`,
    MODIFY `notification_option` ENUM('MAXHR', 'MINHR', 'HR_LIMIT') NOT NULL;

-- AlterTable
ALTER TABLE `notifications` DROP COLUMN `time_in_minutes`,
    MODIFY `option` ENUM('MAXHR', 'MINHR', 'HR_LIMIT') NOT NULL;
