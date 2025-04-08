/*
  Warnings:

  - Made the column `time` on table `symptoms` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `symptoms` MODIFY `time` VARCHAR(191) NOT NULL;
