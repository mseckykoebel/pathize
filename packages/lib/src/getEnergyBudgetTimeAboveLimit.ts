import { Prisma, Crash } from "@pathize/db";
import { HeartRateDataSample } from "terra-api/lib/cjs/models/samples/HeartRateDataSample";

import { convertMinutesToHoursAndMinutes } from "./convertMinutesToHoursAndMinutes";
import { getTimeAboveLimit } from "./getTimeAboveLimit";

export function getEnergyBudgetTimeAboveLimit(
  limit: number,
  crashes: Crash[],
  dailyData: {
    date: string;
    heartRateSamples: Prisma.JsonValue;
  }[],
  formatString = true
) {
  let timeAboveLimit = 0;
  let periodsWhereDailyPresent = 0; // total number of crashes
  let averageTimeAboveLimitForPeriod = 0;
  for (const crash of crashes) {
    const crashDay = crash.createdDay;

    // find the dailyDataSorted day that matches the crash createdDay
    const dailyDataDay = dailyData.find((d) => d.date === crashDay);
    if (!dailyDataDay) continue;

    // if there is a dailyData day that matches the crash createdDay, determine the time above limit for that day, as well as the day before, and two days before
    let numSampleDaysAvailable = 0;
    let timeAboveLimitForPeriod = 0;
    const dailyDataDayIndex = dailyData.indexOf(dailyDataDay);
    // Get the total time above limit for this period, and iterate if the points are found
    for (let i = 0; i <= 2; i++) {
      const currentDay = dailyData[dailyDataDayIndex - i];

      if (
        currentDay?.heartRateSamples &&
        (
          JSON.parse(
            currentDay.heartRateSamples as string
          ) as HeartRateDataSample[]
        ).length > 0
      ) {
        const samples = JSON.parse(
          currentDay.heartRateSamples as string
        ) as HeartRateDataSample[];
        timeAboveLimitForPeriod += getTimeAboveLimit(samples, limit);
        numSampleDaysAvailable++;
      }
    }

    // if there are no samples for this day, simply continue
    if (numSampleDaysAvailable === 0) continue;
    periodsWhereDailyPresent++;

    averageTimeAboveLimitForPeriod =
      timeAboveLimitForPeriod / numSampleDaysAvailable;
    timeAboveLimit += averageTimeAboveLimitForPeriod;
  }

  if (periodsWhereDailyPresent === 0) return "0";
  const averageTimeAboveLimit = timeAboveLimit / periodsWhereDailyPresent;
  if (!formatString) return averageTimeAboveLimit;
  const time = convertMinutesToHoursAndMinutes(averageTimeAboveLimit);
  return time;
}
