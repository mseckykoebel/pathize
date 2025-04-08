/*
  Warnings:

  - A unique constraint covering the columns `[user_id,target_name]` on the table `user_targets` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `user_targets_user_id_target_name_key` ON `user_targets`(`user_id`, `target_name`);
