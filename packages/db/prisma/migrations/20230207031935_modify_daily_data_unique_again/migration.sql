/*
  Warnings:

  - A unique constraint covering the columns `[date]` on the table `daily_data` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `daily_data_date_key` ON `daily_data`(`date`);
