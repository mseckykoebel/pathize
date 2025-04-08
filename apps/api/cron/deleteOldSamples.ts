import { Params } from "fastify-cron";
import { deleteOldSamples } from "../terra/utils";

// Delete daily data older than 15 days with apple resource
export const deleteOldSamplesJob = {
  cronTime: "0 0 * * 0",
  onTick: async () => deleteOldSamples(),
} as Params;
