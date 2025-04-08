import { Daily } from "terra-api";
import dayjs from "dayjs";

import { updateOrCreateDailyRecord } from "./";
import { DeviceResource } from "@pathize/db";

export async function processDailyData(
  dailyData: Daily[],
  userId: string,
  terraUserId: string,
  terraResource: DeviceResource,
  latestWebhookUpdate: Date | null,
) {
  let mostRecentStartTime = dailyData[0].metadata.start_time;
  let mostRecentDailyData = dailyData[0];

  for (let i = 0; i < dailyData.length; i++) {
    const item = dailyData[i];
    if (dayjs(item.metadata.start_time).isAfter(dayjs(mostRecentStartTime))) {
      mostRecentStartTime = item.metadata.start_time;
      mostRecentDailyData = item;
    }
    const date = dayjs(item.metadata.start_time).format("YYYY-MM-DD");
    await updateOrCreateDailyRecord(
      item,
      userId,
      terraUserId,
      terraResource,
      latestWebhookUpdate,
      date,
    );
  }

  return mostRecentDailyData;
}
