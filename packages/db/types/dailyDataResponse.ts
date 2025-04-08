import { HeartRateDataSample } from "terra-api/lib/cjs/models/samples/HeartRateDataSample";

export type DailyDataResponse = {
  updatedAt: Date | null;
  heartRateData: HeartRateDataSample[];
};
