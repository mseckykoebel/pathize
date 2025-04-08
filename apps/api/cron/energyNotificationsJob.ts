import { Params } from "fastify-cron";
import { sendEnergyNotifications } from "./sendEnergyNotifications";

// Delete daily data older than 15 days with apple resource
export const energyNotificationsJob = {
  cronTime: "* * * * *",
  onTick: () => {
    console.log("Energy notifications job is running");
    sendEnergyNotifications();
  },
} as Params;
