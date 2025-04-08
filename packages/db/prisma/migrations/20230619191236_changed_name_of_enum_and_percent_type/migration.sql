/*
  Warnings:

  - The values [HRLIMIT,HRLIMITPERCENT] on the enum `notification_logs_notification_option` will be removed. If these variants are still used in the database, this will fail.
  - The values [HRLIMIT,HRLIMITPERCENT] on the enum `notification_logs_notification_option` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `notification_logs` MODIFY `notification_option` ENUM('MAXHR', 'MINHR', 'HR_LIMIT', 'HR_LIMIT_PERCENT') NOT NULL,
    MODIFY `time_in_minutes` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `notifications` MODIFY `option` ENUM('MAXHR', 'MINHR', 'HR_LIMIT', 'HR_LIMIT_PERCENT') NOT NULL;
