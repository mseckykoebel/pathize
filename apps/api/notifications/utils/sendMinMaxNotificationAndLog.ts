import { HeartRateDataSample } from "terra-api/lib/cjs/models/samples/HeartRateDataSample";
import admin from "firebase-admin";

import { db } from "@pathize/db";
import { convertTimestampToTime, subtractTime } from "../../lib/";
import { getHoursAndMinutes } from "./";

export async function sendMinMaxNotificationAndLog(
  userId: string,
  mostRecentNewHrSampleTime: string,
  mostRecentMinMaxHrSample: HeartRateDataSample,
  extractedTokens: string[],
  timesSpentOverThreshold: number | null,
  timeBetweenNewAndOldPoint: number,
  type: "Minimum" | "Maximum",
  latestWebhookUpdate?: Date | null,
) {
  const minMaxHrTime = convertTimestampToTime(
    mostRecentMinMaxHrSample.timestamp,
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
    )} and ${convertTimestampToTime(mostRecentNewHrSampleTime)}`;
  } else {
    // set all to null
    rhours = null;
    rminutes = null;
    timeString = null;
  }

  console.log(
    "SENDING THIS OUT: ",
    `Your heart rate reached ${Math.trunc(
      mostRecentMinMaxHrSample.bpm,
    )} bpm at ${minMaxHrTime}. ${
      timeString
        ? `You crossed this limit ${timesSpentOverThreshold} times between ${timeString}.`
        : ""
    }`,
  );

  const batchResponse = await admin.messaging().sendEachForMulticast({
    tokens: extractedTokens,
    notification: {
      title: `${type} heart rate notice`,
      body: `Your heart rate reached ${Math.trunc(
        mostRecentMinMaxHrSample.bpm,
      )} bpm at ${minMaxHrTime}. ${
        timeString
          ? `You crossed this limit ${timesSpentOverThreshold} times between ${timeString}.`
          : ""
      }`,
    },
  });

  if (batchResponse.successCount > 0) {
    await db.notificationLog.create({
      data: {
        userId: userId,
        notificationOption: type === "Minimum" ? "MINHR" : "MAXHR",
        value: Math.trunc(mostRecentMinMaxHrSample.bpm),
        latestWebhookUpdate: latestWebhookUpdate ?? null,
      },
    });
  }
}
