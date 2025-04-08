/*
  Warnings:

  - Added the required column `name` to the `check_ins` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `check_ins` ADD COLUMN `name` VARCHAR(191) NOT NULL;
