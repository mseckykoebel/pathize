/*
  Warnings:

  - Added the required column `created_day` to the `medications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `medications` ADD COLUMN `created_day` VARCHAR(191) NOT NULL;
