-- CreateTable
CREATE TABLE `referrals` (
    `id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `referrer_user_id` VARCHAR(191) NOT NULL,
    `referee_user_id` VARCHAR(191) NOT NULL,
    `referrer_referral_code` VARCHAR(191) NULL,

    INDEX `referrals_referrer_user_id_idx`(`referrer_user_id`),
    INDEX `referrals_referee_user_id_idx`(`referee_user_id`),
    INDEX `referrals_referrer_referral_code_idx`(`referrer_referral_code`),
    UNIQUE INDEX `referrals_referrer_user_id_referee_user_id_key`(`referrer_user_id`, `referee_user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `referral_codes` (
    `id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `code` VARCHAR(8) NOT NULL,
    `user_id` VARCHAR(191) NULL,

    UNIQUE INDEX `referral_codes_code_key`(`code`),
    INDEX `referral_codes_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `promotions` (
    `id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `promotionIdentifier` ENUM('p_free_1m_v1', 'p_free_3m_v1', 'PH1M2023') NOT NULL,
    `promotionType` ENUM('OFFER_CODE', 'PROMOTIONAL_OFFER') NOT NULL,
    `user_id` VARCHAR(191) NULL,

    INDEX `promotions_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
