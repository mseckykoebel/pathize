import { Daily, Sleep } from "terra-api";
import dayjs from "dayjs";

export function getMostRecentRecord(dailyData: (Daily | Sleep)[]) {
  const sortedDailyData = dailyData.sort(
    (a, b) =>
      dayjs(b.metadata.start_time).unix() - dayjs(a.metadata.start_time).unix()
  );

  return sortedDailyData[0];
}
