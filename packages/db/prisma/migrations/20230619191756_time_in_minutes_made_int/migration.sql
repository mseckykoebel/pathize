/*
  Warnings:

  - You are about to alter the column `time_in_minutes` on the `notification_logs` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `time_in_minutes` on the `notifications` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `notification_logs` MODIFY `time_in_minutes` INTEGER NULL;

-- AlterTable
ALTER TABLE `notifications` MODIFY `time_in_minutes` INTEGER NULL;
