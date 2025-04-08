import admin from "firebase-admin";

import { db } from "@pathize/db";
import {
  getEnabledCheckIns,
  getTokens,
  isTimeToNotifyWithTimezone,
} from "./lib";

type CheckInNotification = {
  userId: string;
  checkInId: string;
  name: string;
  time: Date;
  timezone: string | null;
};

async function sendFirebaseNotification(notification: CheckInNotification) {
  try {
    const fcmTokens = await getTokens(notification.userId);
    if (!fcmTokens) return;

    const message = {
      tokens: fcmTokens,
      notification: {
        title: "Check-in reminder",
        body: `It's time to record your ${notification.name} check-in.`,
      },
      data: {
        type: "CHECK_IN",
        checkInId: notification.checkInId,
      },
    };

    const batchedResponse = await admin
      .messaging()
      .sendEachForMulticast(message);

    if (batchedResponse.successCount > 0) {
      await db.notificationLog.create({
        data: {
          userId: notification.userId,
          notificationOption: "CHECK_IN",
          value: null,
          latestWebhookUpdate: null,
        },
      });
    }
  } catch (err) {
    console.log("Error sending notification: ", err);
  }
}

export async function sendCheckInNotifications() {
  try {
    // get enabled check-ins and format
    const enabledCheckIns = await getEnabledCheckIns(true);
    const checkIns: CheckInNotification[] = enabledCheckIns.map((checkIn) => {
      return {
        userId: checkIn.user.id,
        checkInId: checkIn.id,
        name: checkIn.name,
        time: checkIn.time,
        timezone: checkIn.user.timezone,
      };
    });

    // is it time to send this check-in
    const notificationsToSend = checkIns.filter((checkIn) =>
      isTimeToNotifyWithTimezone(checkIn.time, checkIn.timezone)
    );

    console.log("Check-in notifications to send: ", notificationsToSend);

    // send notifications
    notificationsToSend.forEach((notification) => {
      sendFirebaseNotification(notification);
    });
  } catch (err) {
    console.log("Error sending notification: ", err);
  }
}
