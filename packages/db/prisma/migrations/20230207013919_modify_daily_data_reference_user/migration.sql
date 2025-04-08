/*
  Warnings:

  - You are about to drop the column `device_id` on the `daily_data` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `daily_data` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `daily_data_device_id_idx` ON `daily_data`;

-- AlterTable
ALTER TABLE `daily_data` DROP COLUMN `device_id`,
    ADD COLUMN `user_id` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `daily_data_user_id_idx` ON `daily_data`(`user_id`);
