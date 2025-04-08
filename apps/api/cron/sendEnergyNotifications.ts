import admin from "firebase-admin";
import { db, $Enums } from "@pathize/db";
import dayjs from "dayjs";

import {
  getNotifications,
  getUsersWithNotificationsEnabled,
  isTimeToNotifyWithTimezone,
  userCanReceiveEnergyNotifications,
} from "./lib";
import { getTokens } from "./lib/getTokens";

// 7 am
const MORNING_TIME = dayjs()
  .set("hour", 7)
  .set("minute", 0)
  .set("second", 0)
  .toDate();

// 12 pm
const AFTERNOON_TIME = dayjs()
  .set("hour", 12)
  .set("minute", 0)
  .set("second", 0)
  .toDate();

// 5 pm
const EVENING_TIME = dayjs()
  .set("hour", 17)
  .set("minute", 0)
  .set("second", 0)
  .toDate();

// 8 pm
const NIGHT_TIME = dayjs()
  .set("hour", 20)
  .set("minute", 0)
  .set("second", 0)
  .toDate();

async function sendFirebaseNotification(notification: EnergyNotification) {
  try {
    const fcmTokens = await getTokens(notification.userId);
    if (!fcmTokens) return;

    const message = {
      tokens: fcmTokens,
      notification: {
        title: "Energy update",
        body: "This is a test of energy notifications",
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

type EnergyNotification = {
  userId: string;
  timezone: string | null;
  option: $Enums.NotificationOption;
};

export async function sendEnergyNotifications() {
  try {
    const usersWhereNotificationsAreOn =
      await getUsersWithNotificationsEnabled();

    // check to see if the user(s) are qualified to get energy notifications (based on crashes, etc.)
    const userIdsEnabled = (
      await Promise.all(
        usersWhereNotificationsAreOn.map(async (user) => {
          const canReceive = await userCanReceiveEnergyNotifications(user.id);
          return canReceive ? user.id : null;
        })
      )
    ).filter((userId): userId is string => userId !== null);

    // construct notifications based on who can get them
    const filteredUserIds = userIdsEnabled.filter(Boolean);
    const rawNotifications = await getNotifications(
      filteredUserIds,
      [{ option: "ENERGY" }],
      true
    );

    const notifications: EnergyNotification[] = rawNotifications.map(
      (notification) => ({
        userId: notification.user.id,
        timezone: notification.user.timezone,
        option: notification.option,
      })
    );

    const notificationsToSendMorning = notifications.filter((notification) =>
      isTimeToNotifyWithTimezone(MORNING_TIME, notification.timezone)
    );
    const notificationsToSendAfternoon = notifications.filter((notification) =>
      isTimeToNotifyWithTimezone(AFTERNOON_TIME, notification.timezone)
    );
    const notificationsToSendEvening = notifications.filter((notification) =>
      isTimeToNotifyWithTimezone(EVENING_TIME, notification.timezone)
    );
    const notificationsToSendNight = notifications.filter((notification) =>
      isTimeToNotifyWithTimezone(NIGHT_TIME, notification.timezone)
    );

    // merge all notifications to send
    const notificationsToSend = [
      ...notificationsToSendMorning,
      ...notificationsToSendAfternoon,
      ...notificationsToSendEvening,
      ...notificationsToSendNight,
    ];

    if (notificationsToSend.length === 0) {
      console.log("No notifications to send! Returning...");
      return;
    }

    console.log("Sending these notifications: ", notificationsToSend);

    // Not ready! Uncomment when this feature is implemented...
    notificationsToSend.forEach((notification) => {
      sendFirebaseNotification(notification);
    });
  } catch (err) {
    console.log("Error getting users where notifications are on: ", err);
  }
}
