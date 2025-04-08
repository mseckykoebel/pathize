import { HeartRateDataSample } from "terra-api/lib/cjs/models/samples/HeartRateDataSample";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import { getValueAndTokens, sendMinMaxNotificationAndLog } from "./utils";

dayjs.extend(utc);
dayjs.extend(timezone);

export async function checkMaxHrExceeded(
  userId: string,
  brandNewHrSamples: HeartRateDataSample[] | null,
  mostRecentSampleTimestamp: string | null,
  latestWebhookUpdate: Date | null,
) {
  // Check early conditions to return
  if (!brandNewHrSamples || brandNewHrSamples.length === 0) return;

  try {
    const valueAndTokens = await getValueAndTokens(userId, "MAXHR");

    if (!valueAndTokens) return;

    const { hrValue, extractedTokens } = valueAndTokens;

    // Check latest point
    const lastPointInNewDataArray = dayjs(
      brandNewHrSamples[brandNewHrSamples.length - 1].timestamp,
    );
    const lastPointInDbDataArray = mostRecentSampleTimestamp
      ? dayjs(mostRecentSampleTimestamp)
      : lastPointInNewDataArray.subtract(1, "hour");

    // Return if not the same day
    if (lastPointInDbDataArray) {
      if (
        !lastPointInNewDataArray.isSame(lastPointInDbDataArray, "day") &&
        lastPointInNewDataArray.isBefore(lastPointInDbDataArray, "day")
      ) {
        console.log("not the same day!");
        console.log(lastPointInNewDataArray);
        console.log(lastPointInDbDataArray);
        return;
      }
    }

    // Time calculations and send notifications
    let timesSpentOverThreshold: number | null = 0;
    let mostRecentMaxHrSample: HeartRateDataSample | null = null;
    // iterate in reverse order, until we reach the most recent sample in the db, or the end (the start of the day)
    for (let i = brandNewHrSamples.length - 1; i >= 0; i--) {
      const sample = brandNewHrSamples[i];
      if (
        mostRecentSampleTimestamp &&
        dayjs(sample.timestamp).isBefore(mostRecentSampleTimestamp)
      ) {
        break;
      }
      if (sample.bpm > hrValue) {
        timesSpentOverThreshold++;
        if (!mostRecentMaxHrSample) mostRecentMaxHrSample = sample;
      }
    }

    // check if the last point in DB data array timestamp was longer than 15 minutes ago
    let timeBetweenNewAndOldPoint = lastPointInNewDataArray.diff(
      lastPointInDbDataArray,
      "minute",
    );
    if (timeBetweenNewAndOldPoint < 15) {
      timesSpentOverThreshold = null;
    } else if (timeBetweenNewAndOldPoint > 60) {
      // force set to
      timeBetweenNewAndOldPoint = 60;
    }

    // Send notifications
    if (mostRecentMaxHrSample) {
      await sendMinMaxNotificationAndLog(
        userId,
        brandNewHrSamples[brandNewHrSamples.length - 1].timestamp,
        mostRecentMaxHrSample,
        extractedTokens,
        timesSpentOverThreshold,
        timeBetweenNewAndOldPoint,
        "Maximum",
        latestWebhookUpdate,
      );
    }
  } catch (error) {
    console.log(error);
  }
}
