import admin from "firebase-admin";

import { $Enums, db } from "@pathize/db";
import {
  getTokens,
  isTimeToNotifyWithTimezone,
  getNotifications,
  getUsersWithNotificationsEnabled,
} from "./lib";

type ReminderNotification = {
  userId: string;
  timezone: string | null;
  option: $Enums.NotificationOption;
  time: Date;
};

async function sendFirebaseNotification(notification: ReminderNotification) {
  try {
    const fcmTokens = await getTokens(notification.userId);
    if (!fcmTokens) return;

    const message = {
      tokens: fcmTokens,
      notification: {
        title:
          notification.option === "MORNING_REMINDER"
            ? "Morning reminder"
            : "Evening reminder",
        body:
          notification.option === "MORNING_REMINDER"
            ? "This is your morning reminder to record aspects of your condition in Pathize"
            : "This is your evening reminder to record aspects of your condition in Pathize",
      },
    };

    const batchedResponse = await admin
      .messaging()
      .sendEachForMulticast(message);

    if (batchedResponse.successCount > 0) {
      await db.notificationLog.create({
        data: {
          userId: notification.userId,
          notificationOption: notification.option,
          value: null,
          latestWebhookUpdate: null,
        },
      });
    }
  } catch (err) {
    console.log("Error sending notification: ", err);
  }
}

export async function sendReminderNotifications() {
  try {
    const usersWhereNotificationsAreOn =
      await getUsersWithNotificationsEnabled();
    const userIdsEnabled = usersWhereNotificationsAreOn.map((user) => user.id);
    const rawNotifications = await getNotifications(
      userIdsEnabled,
      [{ option: "MORNING_REMINDER" }, { option: "EVENING_REMINDER" }],
      true
    );

    const notifications: ReminderNotification[] = rawNotifications.map(
      (notification) => ({
        userId: notification.user.id,
        timezone: notification.user.timezone,
        option: notification.option,
        time: notification.time as Date,
      })
    );

    const notificationsToSend = notifications.filter((notification) =>
      isTimeToNotifyWithTimezone(notification.time, notification.timezone)
    );

    console.log("notifications to send: ", notificationsToSend);

    notificationsToSend.forEach((notification) => {
      sendFirebaseNotification(notification);
    });
  } catch (err) {
    console.log("Error getting users where notifications are on: ", err);
    return;
  }
}
