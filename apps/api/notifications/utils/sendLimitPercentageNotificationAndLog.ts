/* eslint-disable indent */
import admin from "firebase-admin";

import { db } from "@pathize/db";

export async function sendLimitPercentageNotificationAndLog(
  userId: string,
  numHours: number,
  numMinutes: number,
  percentile: number,
  extractedTokens: string[],
  latestWebhookUpdate?: Date | null,
) {
  const batchResponse = await admin.messaging().sendEachForMulticast({
    tokens: extractedTokens,
    notification: {
      title: `Time above limit notice`,
      body: `You recently surpassed ${String(
        percentile,
      )}% of your set heart rate limit, for a total of ${
        numHours > 0 ? `${numHours} hour${numHours > 1 ? "s" : ""} and ` : ""
      }${numMinutes} minute${numMinutes > 1 ? "s" : ""}.`,
    },
  });

  if (batchResponse.successCount > 0) {
    await db.notificationLog.create({
      data: {
        userId: userId,
        notificationOption: "HR_LIMIT",
        value: numHours + 60 + numMinutes,
        latestWebhookUpdate: latestWebhookUpdate ?? null,
      },
    });
  }
}
