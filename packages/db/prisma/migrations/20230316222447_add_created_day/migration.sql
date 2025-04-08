/*
  Warnings:

  - Added the required column `created_day` to the `crashes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `crashes` ADD COLUMN `created_day` VARCHAR(191) NOT NULL;
