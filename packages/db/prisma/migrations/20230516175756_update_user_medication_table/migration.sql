/*
  Warnings:

  - Added the required column `type` to the `user_medications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user_medications` ADD COLUMN `strength` DOUBLE NULL,
    ADD COLUMN `type` VARCHAR(191) NOT NULL,
    ADD COLUMN `unit` VARCHAR(191) NULL;
