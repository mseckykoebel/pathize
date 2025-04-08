import { HeartRateDataSample } from "terra-api/lib/cjs/models/samples/HeartRateDataSample";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import { getValueAndTokens, sendMinMaxNotificationAndLog } from "./utils";

dayjs.extend(utc);
dayjs.extend(timezone);

export async function checkMinHrExceeded(
  userId: string,
  heartRateSamples: HeartRateDataSample[] | null,
  mostRecentSampleTimestamp: string | null,
  latestWebhookUpdate: Date | null,
) {
  // Check early conditions to return
  if (!heartRateSamples || heartRateSamples.length === 0) return;

  try {
    const valueAndTokens = await getValueAndTokens(userId, "MINHR");

    if (!valueAndTokens) return;

    const { hrValue, extractedTokens } = valueAndTokens;

    // Check latest point
    const lastPointInNewDataArray = dayjs(
      heartRateSamples[heartRateSamples.length - 1].timestamp,
    );
    const lastPointInDbDataArray = mostRecentSampleTimestamp
      ? dayjs(mostRecentSampleTimestamp)
      : lastPointInNewDataArray.subtract(1, "hour");

    // Return if not the same day
    if (lastPointInDbDataArray) {
      if (
        !lastPointInNewDataArray.isSame(lastPointInDbDataArray, "day") &&
        lastPointInNewDataArray.isBefore(lastPointInDbDataArray, "day")
      )
        return;
    }

    // Time calculations and send notifications
    let timesSpentOverThreshold: number | null = 0;
    let mostRecentMinHrSample: HeartRateDataSample | null = null;
    // iterate in reverse order, until we reach the most recent sample in the db, or the end (the start of the day)
    for (let i = heartRateSamples.length - 1; i >= 0; i--) {
      const sample = heartRateSamples[i];
      if (
        mostRecentSampleTimestamp &&
        dayjs(sample.timestamp).isBefore(mostRecentSampleTimestamp)
      ) {
        break;
      }
      if (sample.bpm < hrValue) {
        timesSpentOverThreshold++;
        if (!mostRecentMinHrSample) mostRecentMinHrSample = sample;
      }
    }

    let timeBetweenNewAndOldPoint = lastPointInNewDataArray.diff(
      lastPointInDbDataArray,
      "minute",
    );
    // check if the last point in DB data array timestamp was longer than 15 minutes ago
    if (timeBetweenNewAndOldPoint < 15) {
      timesSpentOverThreshold = null;
    } else if (timeBetweenNewAndOldPoint > 60) {
      timeBetweenNewAndOldPoint = 60;
    }

    // Send notifications
    if (mostRecentMinHrSample) {
      await sendMinMaxNotificationAndLog(
        userId,
        heartRateSamples[heartRateSamples.length - 1].timestamp,
        mostRecentMinHrSample,
        extractedTokens,
        timesSpentOverThreshold,
        timeBetweenNewAndOldPoint,
        "Minimum",
        latestWebhookUpdate,
      );
    }
  } catch (error) {
    console.log(error);
  }
}
