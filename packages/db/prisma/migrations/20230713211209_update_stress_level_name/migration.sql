/*
  Warnings:

  - You are about to drop the column `average_stress_level` on the `daily_data` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `daily_data` DROP COLUMN `average_stress_level`,
    ADD COLUMN `avg_stress_level` DOUBLE NULL;
