/*
  Warnings:

  - You are about to alter the column `upload_type` on the `daily_data` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(7))` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `daily_data` MODIFY `upload_type` VARCHAR(191) NULL;
