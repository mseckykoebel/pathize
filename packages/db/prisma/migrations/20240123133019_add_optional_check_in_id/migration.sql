-- AlterTable
ALTER TABLE `medications` ADD COLUMN `check_in_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `symptoms` ADD COLUMN `check_in_id` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `medications_check_in_id_idx` ON `medications`(`check_in_id`);

-- CreateIndex
CREATE INDEX `symptoms_check_in_id_idx` ON `symptoms`(`check_in_id`);
