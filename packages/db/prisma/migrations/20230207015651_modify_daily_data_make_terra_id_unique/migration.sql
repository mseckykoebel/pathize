/*
  Warnings:

  - A unique constraint covering the columns `[terra_user_id]` on the table `daily_data` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `terra_user_id` to the `daily_data` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `daily_data` ADD COLUMN `terra_user_id` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `daily_data_terra_user_id_key` ON `daily_data`(`terra_user_id`);
