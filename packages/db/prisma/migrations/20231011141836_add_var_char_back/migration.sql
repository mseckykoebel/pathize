/*
  Warnings:

  - You are about to alter the column `phone_number` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.

*/
-- AlterTable
ALTER TABLE `users` MODIFY `phone_number` VARCHAR(20) NULL;
