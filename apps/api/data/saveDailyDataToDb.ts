import { db, DeviceResource } from "@pathize/db";
import { StepSample } from "terra-api/lib/cjs/models/samples/StepSample";
import dayjs from "dayjs";
import { Daily } from "terra-api";

export async function saveDailyDataToDb(
  userId: string,
  terraUserId: string,
  resource: DeviceResource,
  data: Daily,
) {
  try {
    const stepData: StepSample[] = data.distance_data.detailed.step_samples;
    // metadata
    const distanceMeters = data.distance_data.distance_meters;
    const totalBurnedCalories = data.calories_data.total_burned_calories;
    const restSeconds = data.active_durations_data.rest_seconds;
    const activeSeconds = data.active_durations_data.activity_seconds;
    const lowIntensitySeconds =
      data.active_durations_data.low_intensity_seconds;
    // other data
    const date = dayjs(data.metadata.start_time).format("YYYY-MM-DD");
    // convert step samples to a string
    const stepSamples = JSON.stringify(stepData);
    // heart rate data
    // summary
    const maxHrBpm = data.heart_rate_data.summary.max_hr_bpm;
    const minHrBpm = data.heart_rate_data.summary.min_hr_bpm;
    const avgHrBpm = data.heart_rate_data.summary.avg_hr_bpm;
    const restingHrBpm = data.heart_rate_data.summary.resting_hr_bpm;
    const avgHrvRMSSD = data.heart_rate_data.summary.avg_hrv_rmssd;
    const avgHrvSDNN = data.heart_rate_data.summary.avg_hrv_sdnn;
    const userMaxHrBpm = data.heart_rate_data.summary.user_max_hr_bpm;
    // detailed
    const heartRateData = JSON.stringify(
      data.heart_rate_data.detailed.hr_samples,
    );
    const heartRateVarianceDataSDNN = JSON.stringify(
      data.heart_rate_data.detailed.hrv_samples_sdnn,
    );
    const heartRateVarianceDataRMSSD = JSON.stringify(
      data.heart_rate_data.detailed.hrv_samples_rmssd,
    );
    // save this to the DailyData table in our database
    const dailyDataRecord = await db.dailyData.findFirst({
      where: {
        date: date,
        userId: userId,
        terraUserId: terraUserId,
      },
    });
    // if there is a record, update it
    if (dailyDataRecord) {
      const updateData = await db.dailyData.update({
        where: { id: dailyDataRecord.id },
        data: {
          updatedAt: new Date(),
          stepSamples: stepSamples,
          heartRateSamples: heartRateData,
          heartRateVarianceSamplesSDNN: heartRateVarianceDataSDNN,
          heartRateVarianceSamplesRMSSD: heartRateVarianceDataRMSSD,
          distance: distanceMeters,
          totalCalories: totalBurnedCalories,
          restSeconds: restSeconds,
          activeSeconds: activeSeconds,
          lowIntensitySeconds: lowIntensitySeconds,
          maxHrBpm: maxHrBpm,
          minHrBpm: minHrBpm,
          avgHrBpm: avgHrBpm,
          restingHrBpm: restingHrBpm,
          avgHrvRMSSD: avgHrvRMSSD,
          avgHrvSDNN: avgHrvSDNN,
          userMaxHrBpm: userMaxHrBpm,
        },
      });
      return updateData;
    } else {
      const createData = await db.dailyData.create({
        data: {
          date: date,
          terraUserId: terraUserId,
          userId: userId,
          resource: resource,
          distance: distanceMeters,
          totalCalories: totalBurnedCalories,
          restSeconds: restSeconds,
          activeSeconds: activeSeconds,
          lowIntensitySeconds: lowIntensitySeconds,
          stepSamples: stepSamples,
          heartRateSamples: heartRateData,
          heartRateVarianceSamplesSDNN: heartRateVarianceDataSDNN,
          heartRateVarianceSamplesRMSSD: heartRateVarianceDataRMSSD,
          maxHrBpm: maxHrBpm,
          minHrBpm: minHrBpm,
          avgHrBpm: avgHrBpm,
          restingHrBpm: restingHrBpm,
          avgHrvRMSSD: avgHrvRMSSD,
          avgHrvSDNN: avgHrvSDNN,
          userMaxHrBpm: userMaxHrBpm,
        },
      });
      return createData;
    }
  } catch (err) {
    console.error(err);
    return "error";
  }
}
