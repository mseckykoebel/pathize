/* eslint-disable indent */
import { HeartRateDataSample } from "terra-api/lib/cjs/models/samples/HeartRateDataSample";
import admin from "firebase-admin";

import { db } from "@pathize/db";
import { convertTimestampToTime, subtractTime } from "../../lib/";
import { getHoursAndMinutes } from "./";

export async function sendLimitNotificationAndLog(
  userId: string,
  mostRecentNewHrSampleTime: string,
  mostRecentOverLimitHrSample: HeartRateDataSample,
  extractedTokens: string[],
  timesSpentOverThreshold: number | null,
  timeBetweenNewAndOldPoint: number,
  hoursOverLimit: number,
  minutesOverLimit: number,
  latestWebhookUpdate?: Date | null,
) {
  const overLimitTime = convertTimestampToTime(
    mostRecentOverLimitHrSample.timestamp,
  );
  const timeBetweenLastUpdatedAndMostRecentPoint =
    timesSpentOverThreshold && timeBetweenNewAndOldPoint
      ? getHoursAndMinutes(timeBetweenNewAndOldPoint)
      : null;

  let rhours, rminutes, timeString;
  if (timeBetweenLastUpdatedAndMostRecentPoint) {
    rhours = timeBetweenLastUpdatedAndMostRecentPoint.numHours;
    rminutes = timeBetweenLastUpdatedAndMostRecentPoint.numMinutes;
    timeString = `${subtractTime(
      convertTimestampToTime(mostRecentNewHrSampleTime),
      rhours,
      rminutes,
    )} and ${convertTimestampToTime(mostRecentNewHrSampleTime)}. You've spent ${
      hoursOverLimit > 0
        ? `${hoursOverLimit} hour${
            hoursOverLimit > 1 ? "s" : ""
          } and ${minutesOverLimit} minute${
            minutesOverLimit > 1 ? "s" : ""
          } over your limit today`
        : `${minutesOverLimit} minute${
            minutesOverLimit > 1 ? "s" : ""
          } over your limit today`
    }`;
  } else {
    // set all to null
    rhours = null;
    rminutes = null;
    timeString = null;
  }

  console.log(
    "SENDING THIS OUT: ",
    `Your heart rate reached ${Math.trunc(
      mostRecentOverLimitHrSample.bpm,
    )} bpm at ${overLimitTime}. ${
      timeString && timesSpentOverThreshold
        ? `You crossed this limit ${timesSpentOverThreshold} time${
            timesSpentOverThreshold > 1 ? "s" : ""
          } between ${timeString}.`
        : ""
    }`,
  );

  const batchResponse = await admin.messaging().sendEachForMulticast({
    tokens: extractedTokens,
    notification: {
      title: `Over limit notice`,
      body: `Your heart rate reached ${Math.trunc(
        mostRecentOverLimitHrSample.bpm,
      )} bpm at ${overLimitTime}. ${
        timeString && timesSpentOverThreshold
          ? `You crossed this limit ${timesSpentOverThreshold} time${
              timesSpentOverThreshold > 1 ? "s" : ""
            } between ${timeString}.`
          : ""
      }`,
    },
  });

  if (batchResponse.successCount > 0) {
    await db.notificationLog.create({
      data: {
        userId: userId,
        notificationOption: "HR_LIMIT",
        value: minutesOverLimit ?? null,
        latestWebhookUpdate: latestWebhookUpdate ?? null,
      },
    });
  }
}
