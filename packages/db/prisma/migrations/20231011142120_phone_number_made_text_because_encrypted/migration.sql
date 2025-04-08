-- DropIndex
DROP INDEX `users_phone_number_key` ON `users`;

-- AlterTable
ALTER TABLE `users` MODIFY `phone_number` TEXT NULL;
