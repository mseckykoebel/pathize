import { getTerraEnv } from ".";

export async function getDailyToWebhook(
  terraUserId: string,
  start: Date,
  end: Date,
  toWebhook: boolean,
) {
  const terra = getTerraEnv();
  try {
    await terra.getDaily({
      userId: terraUserId,
      startDate: start,
      endDate: end,
      toWebhook: toWebhook,
    });
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
