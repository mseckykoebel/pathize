/*
  Warnings:

  - A unique constraint covering the columns `[medication_id]` on the table `medication_db` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[symptom_id]` on the table `symptom_db` will be added. If there are existing duplicate values, this will fail.
  - Made the column `symptom_id` on table `symptom_db` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `symptom_db` MODIFY `symptom_id` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `medication_db_medication_id_key` ON `medication_db`(`medication_id`);

-- CreateIndex
CREATE UNIQUE INDEX `symptom_db_symptom_id_key` ON `symptom_db`(`symptom_id`);
