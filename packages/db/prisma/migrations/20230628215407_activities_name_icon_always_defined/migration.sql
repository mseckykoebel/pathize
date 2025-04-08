/*
  Warnings:

  - Made the column `activity_icon` on table `user_activities` required. This step will fail if there are existing NULL values in that column.
  - Made the column `activity_name` on table `user_activities` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `user_activities` MODIFY `activity_icon` VARCHAR(191) NOT NULL,
    MODIFY `activity_name` VARCHAR(191) NOT NULL;
