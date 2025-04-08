import { Params } from "fastify-cron";
import { sendCheckInNotifications } from "./sendCheckInNotifications";

export const checkInNotificationsJob = {
  cronTime: "* * * * *",
  onTick: async () => {
    console.log("Check-ins job is running");
    await sendCheckInNotifications();
  },
} as Params;
