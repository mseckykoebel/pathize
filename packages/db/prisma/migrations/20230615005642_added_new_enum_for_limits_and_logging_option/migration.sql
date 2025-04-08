-- AlterTable
ALTER TABLE `notification_logs` ADD COLUMN `time_in_minutes` INTEGER NULL,
    MODIFY `notification_option` ENUM('MAXHR', 'MINHR', 'HRLIMIT', 'HRLIMITPERCENT') NOT NULL;

-- AlterTable
ALTER TABLE `notifications` MODIFY `option` ENUM('MAXHR', 'MINHR', 'HRLIMIT', 'HRLIMITPERCENT') NOT NULL;
