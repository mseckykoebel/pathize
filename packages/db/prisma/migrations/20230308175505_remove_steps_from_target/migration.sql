/*
  Warnings:

  - The values [STEPS] on the enum `user_targets_target_name` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `user_targets` MODIFY `target_name` ENUM('BASELINE') NOT NULL;
