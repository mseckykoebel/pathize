-- DropForeignKey
ALTER TABLE `device_connections` DROP FOREIGN KEY `device_connections_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `refresh_tokens` DROP FOREIGN KEY `refresh_tokens_userId_fkey`;

-- DropForeignKey
ALTER TABLE `sdk_connections` DROP FOREIGN KEY `sdk_connections_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `user_targets` DROP FOREIGN KEY `user_targets_user_id_fkey`;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `accepted_terms` BOOLEAN NOT NULL DEFAULT false;

-- RenameIndex
ALTER TABLE `device_connections` RENAME INDEX `device_connections_user_id_fkey` TO `device_connections_user_id_idx`;

-- RenameIndex
ALTER TABLE `refresh_tokens` RENAME INDEX `refresh_tokens_userId_fkey` TO `refresh_tokens_userId_idx`;

-- RenameIndex
ALTER TABLE `sdk_connections` RENAME INDEX `sdk_connections_user_id_fkey` TO `sdk_connections_user_id_idx`;

-- RenameIndex
ALTER TABLE `user_targets` RENAME INDEX `user_targets_user_id_fkey` TO `user_targets_user_id_idx`;
