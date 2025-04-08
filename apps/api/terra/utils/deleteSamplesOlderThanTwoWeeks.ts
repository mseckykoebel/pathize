import dayjs from "dayjs";
import { db, Prisma } from "@pathize/db";

export async function deleteOldSamples() {
  // First, retrieve all of the terra IDs
  const deviceConnections = await db.deviceConnection.findMany();
  const terraUserIds = deviceConnections.map((dc) => dc.terraUserId);

  // Now, delete from dailyData where createdAt is older than ~3 months
  const twoWeeksAgo = dayjs().subtract(96, "days").toDate(); // add one day to be safe
  for (const terraId of terraUserIds) {
    /**
     * Make
     * saturationSamples
     * vo2Samples
     * stepSamples
     * distanceSamples
     * elevationSamples
     * metSamples
     * calorieSamples
     * heartRateVarianceSamplesSDNN
     * heartRateVarianceSamplesRMSSD
     * activityLevelsSamples
     * stressDataSamples
     * all Prisma.DbNull for DailyData
     */
    await db.dailyData.updateMany({
      where: {
        terraUserId: terraId,
        createdAt: {
          lt: twoWeeksAgo,
        },
      },
      data: {
        saturationSamples: Prisma.DbNull,
        vo2Samples: Prisma.DbNull,
        stepSamples: Prisma.DbNull,
        distanceSamples: Prisma.DbNull,
        elevationSamples: Prisma.DbNull,
        metSamples: Prisma.DbNull,
        calorieSamples: Prisma.DbNull,
        heartRateVarianceSamplesSDNN: Prisma.DbNull,
        heartRateVarianceSamplesRMSSD: Prisma.DbNull,
        activityLevelsSamples: Prisma.DbNull,
        stressDataSamples: Prisma.DbNull,
      },
    });

    /**
     * Make
     * hypnogramSamples
     * heartRateVarianceSamplesSDNN
     * heartRateVarianceSamplesRMSSD
     * respirationDataSamples
     * snoringDataSamples
     * oxygenSaturationDataSamples
     * Prisma.DbNull for SleepData
     */
    await db.sleepData.updateMany({
      where: {
        terraUserId: terraId,
        createdAt: {
          lt: twoWeeksAgo,
        },
      },
      data: {
        hypnogramSamples: Prisma.DbNull,
        heartRateVarianceSamplesSDNN: Prisma.DbNull,
        heartRateVarianceSamplesRMSSD: Prisma.DbNull,
        respirationDataSamples: Prisma.DbNull,
        snoringDataSamples: Prisma.DbNull,
        oxygenSaturationDataSamples: Prisma.DbNull,
      },
    });
  }
}
