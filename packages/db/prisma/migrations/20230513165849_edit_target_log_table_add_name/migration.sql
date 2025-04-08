/*
  Warnings:

  - Added the required column `targetName` to the `target_logs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `target_logs` ADD COLUMN `targetName` ENUM('BASELINE') NOT NULL;
