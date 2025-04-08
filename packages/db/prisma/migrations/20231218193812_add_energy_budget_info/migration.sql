/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `user_targets` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `target_logs` MODIFY `targetName` ENUM('BASELINE', 'ENERGY_BUDGET') NOT NULL;

-- AlterTable
ALTER TABLE `user_targets` MODIFY `target_name` ENUM('BASELINE', 'ENERGY_BUDGET') NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `user_targets_user_id_key` ON `user_targets`(`user_id`);
