-- CreateTable
CREATE TABLE `activity_db` (
    `id` VARCHAR(191) NOT NULL,
    `activity_id` VARCHAR(191) NOT NULL,
    `activity_name` VARCHAR(191) NULL,
    `activity_category` VARCHAR(191) NULL,

    UNIQUE INDEX `activity_db_activity_id_key`(`activity_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
