import { HeartRateDataSample } from "terra-api/lib/cjs/models/samples/HeartRateDataSample";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import { getTimeAboveLimit } from "@pathize/lib";
import {
  getLimitAndTokens,
  sendLimitNotificationAndLog,
  timeConvert,
} from "./utils";

dayjs.extend(utc);
dayjs.extend(timezone);

export async function checkIfLimitExceeded(
  userId: string,
  brandNewHrSamples: HeartRateDataSample[] | null,
  mostRecentSampleTimestamp: string | null,
  latestWebhookUpdate: Date | null
) {
  console.log("Checking if limit exceeded!!!!!");
  if (!brandNewHrSamples || brandNewHrSamples.length === 0) return;

  try {
    const limitAndTokens = await getLimitAndTokens(userId, "HR_LIMIT");
    console.log("limitAndTokens: ", limitAndTokens);
    if (!limitAndTokens) return;

    const { limit, extractedTokens } = limitAndTokens;

    // Check latest point, and return if not the same day
    const lastPointInNewDataArray = dayjs(
      brandNewHrSamples[brandNewHrSamples.length - 1].timestamp
    );
    // Get the last point in the new db data array, or if it does not exist, default to one hour before the updated point
    const lastPointInDbDataArray = mostRecentSampleTimestamp
      ? dayjs(mostRecentSampleTimestamp)
      : lastPointInNewDataArray.subtract(1, "hour");
    if (lastPointInDbDataArray) {
      if (
        !lastPointInNewDataArray.isSame(lastPointInDbDataArray, "day") &&
        lastPointInNewDataArray.isBefore(lastPointInDbDataArray, "day")
      ) {
        console.log("Not the same day!!!");
        return;
      }
    }

    const timeAboveLimit = getTimeAboveLimit(brandNewHrSamples, limit);
    if (timeAboveLimit === 0) return;

    const { numHours, numMinutes } = timeConvert(timeAboveLimit);

    // Time calculations and send notifications
    let timesSpentOverLimit: number | null = 0;
    let mostRecentOverLimitSample: HeartRateDataSample | null = null;
    // iterate in reverse order, until we reach the most recent sample in the db, or the end (the start of the day)
    for (let i = brandNewHrSamples.length - 1; i >= 0; i--) {
      const sample = brandNewHrSamples[i];
      if (
        mostRecentSampleTimestamp &&
        dayjs(sample.timestamp).isBefore(mostRecentSampleTimestamp)
      ) {
        break;
      }
      if (sample.bpm > limit) {
        timesSpentOverLimit++;
        if (!mostRecentOverLimitSample) mostRecentOverLimitSample = sample;
      }
    }

    // check if the last point in DB data array timestamp was longer than 15 minutes ago
    let timeBetweenNewAndOldPoint = lastPointInNewDataArray.diff(
      lastPointInDbDataArray,
      "minute"
    );
    if (timeBetweenNewAndOldPoint < 15) {
      timesSpentOverLimit = null;
    } else if (timeBetweenNewAndOldPoint > 60) {
      // force set to
      timeBetweenNewAndOldPoint = 60;
    }

    if (mostRecentOverLimitSample) {
      await sendLimitNotificationAndLog(
        userId,
        brandNewHrSamples[brandNewHrSamples.length - 1].timestamp,
        mostRecentOverLimitSample,
        extractedTokens,
        timesSpentOverLimit,
        timeBetweenNewAndOldPoint,
        numHours,
        numMinutes,
        latestWebhookUpdate
      );
    }

    // now, send the notification, with the proper thing
  } catch (error) {
    console.log(error);
  }
}
