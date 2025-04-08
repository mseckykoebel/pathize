import { Params } from "fastify-cron";
import { sendReminderNotifications } from "./sendReminderNotifications";

// Delete daily data older than 15 days with apple resource
export const reminderNotificationsJob = {
  cronTime: "* * * * *",
  onTick: async () => {
    console.log("Reminder notifications job is running");
    await sendReminderNotifications();
  },
} as Params;
