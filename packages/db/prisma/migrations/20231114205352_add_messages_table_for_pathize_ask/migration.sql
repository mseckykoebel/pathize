-- CreateTable
CREATE TABLE `messages` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `message_id` VARCHAR(191) NOT NULL,
    `assistant_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAtUnix` INTEGER NOT NULL,
    `thread_id` VARCHAR(191) NOT NULL,
    `role` ENUM('ASSISTANT', 'USER') NOT NULL,
    `content` TEXT NOT NULL,
    `annotations` JSON NULL,
    `file_ids` JSON NULL,

    INDEX `messages_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
