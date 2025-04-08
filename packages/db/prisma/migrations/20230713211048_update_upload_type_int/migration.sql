/*
  Warnings:

  - You are about to alter the column `upload_type` on the `daily_data` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `daily_data` MODIFY `upload_type` INTEGER NULL;
