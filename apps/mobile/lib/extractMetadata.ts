import {Daily} from 'terra-api/lib/cjs/models/Daily';
import {Sleep} from 'terra-api/lib/cjs/models/Sleep';
import {PathizeMetadata} from '../contexts';
import {getMetadata} from '.';

export function extractMetadata(
  dailyData: Daily | undefined,
  sleepData: Sleep | undefined,
  limit: number,
): PathizeMetadata {
  // HEART RATE SAMPLES
  const heartRateSamples = dailyData?.heart_rate_data?.detailed?.hr_samples;

  // BASE HEART METADATA - ALSO MAKE SURE NOT ZERO
  const hrv =
    dailyData?.heart_rate_data?.summary?.avg_hrv_rmssd &&
    dailyData?.heart_rate_data?.summary?.avg_hrv_rmssd !== 0
      ? dailyData?.heart_rate_data?.summary?.avg_hrv_rmssd
      : dailyData?.heart_rate_data?.summary?.avg_hrv_sdnn &&
          dailyData?.heart_rate_data?.summary?.avg_hrv_sdnn !== 0
        ? dailyData?.heart_rate_data?.summary?.avg_hrv_sdnn
        : undefined;
  const restingHeartRate =
    dailyData?.heart_rate_data?.summary?.resting_hr_bpm &&
    dailyData?.heart_rate_data?.summary?.resting_hr_bpm !== 0
      ? dailyData?.heart_rate_data?.summary?.resting_hr_bpm
      : undefined;
  const minHr =
    dailyData?.heart_rate_data?.summary?.min_hr_bpm &&
    dailyData?.heart_rate_data?.summary?.min_hr_bpm !== 0
      ? dailyData?.heart_rate_data?.summary?.min_hr_bpm
      : undefined;
  const maxHr =
    dailyData?.heart_rate_data?.summary?.max_hr_bpm &&
    dailyData?.heart_rate_data?.summary?.max_hr_bpm !== 0
      ? dailyData?.heart_rate_data?.summary?.max_hr_bpm
      : undefined;

  // TIME ABOVE LIMIT
  let timeAboveLimit = 0;
  let processedSamples;
  if (heartRateSamples && heartRateSamples.length > 0) {
    processedSamples = heartRateSamples;
    const metadata = getMetadata(processedSamples, limit);
    timeAboveLimit = metadata.timeAboveLimit;
  }

  const timeStanding = dailyData?.active_durations_data?.standing_seconds
    ? dailyData.active_durations_data.standing_seconds * 60
    : undefined;
  const timeInREMSleep = sleepData?.sleep_durations_data?.asleep
    ?.duration_REM_sleep_state_seconds
    ? sleepData.sleep_durations_data.asleep.duration_REM_sleep_state_seconds *
      60
    : undefined;
  const timeInDeepSleep = sleepData?.sleep_durations_data?.asleep
    ?.duration_deep_sleep_state_seconds
    ? sleepData.sleep_durations_data.asleep.duration_deep_sleep_state_seconds *
      60
    : undefined;
  const nighttimeHrv =
    sleepData?.heart_rate_data?.summary?.avg_hrv_rmssd &&
    sleepData?.heart_rate_data?.summary?.avg_hrv_rmssd !== 0
      ? sleepData?.heart_rate_data?.summary?.avg_hrv_rmssd
      : sleepData?.heart_rate_data?.summary?.avg_hrv_sdnn &&
          sleepData?.heart_rate_data?.summary?.avg_hrv_sdnn !== 0
        ? sleepData?.heart_rate_data?.summary?.avg_hrv_sdnn
        : undefined;
  const steps = dailyData?.distance_data?.steps ?? undefined;

  return {
    timeAboveLimit,
    maxHr,
    minHr,
    restingHr: restingHeartRate,
    hrv,
    timeStanding,
    timeInREMSleep,
    timeInDeepSleep,
    nighttimeHrv,
    steps,
    // additional data
    heartRateSamples: processedSamples,
  };
}
