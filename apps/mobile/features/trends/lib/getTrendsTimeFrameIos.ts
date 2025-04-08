import {Connections, DataMessage, getDaily, getSleep} from 'terra-react';
import {Daily, Sleep} from 'terra-api';
import {HeartRateDataSample} from 'terra-api/lib/cjs/models/samples/HeartRateDataSample';
import dayjs from 'dayjs';

import {TrendsResponse} from '@pathize/api';
import {getTimeAboveLimit} from '@pathize/lib';
import {trendsCategoryMap, trendsMap} from '../../../data';

const isDaily = (data: Daily | Sleep): data is Daily => {
  return (data as Daily).oxygen_data !== undefined;
};

const extractResponse = (dataContainer: DataMessage, limit: number) => {
  if (!dataContainer?.data) return [];

  const data = (dataContainer.data as DataMessage).data;
  if (!Array.isArray(data) || data.length === 0) return [];

  return data
    .map((entry: Daily | Sleep) => {
      if (isDaily(entry)) {
        let timeAboveLimit = 0;
        if (entry?.heart_rate_data?.detailed?.hr_samples) {
          const heartRateDataSamples = entry.heart_rate_data.detailed
            .hr_samples as HeartRateDataSample[];
          timeAboveLimit = getTimeAboveLimit(heartRateDataSamples, limit);
        }

        return {
          data: {
            timeAboveLimit: timeAboveLimit,
            averageSaturationPercentage:
              entry?.oxygen_data?.avg_saturation_percentage ?? null,
            vO2MaxMlPerMinPerKg:
              entry?.oxygen_data?.vo2max_ml_per_min_per_kg ?? null,
            recoveryScore: entry?.scores?.recovery ?? null,
            activityScore: entry?.scores?.activity ?? null,
            sleepScore: entry?.scores?.sleep ?? null,
            swimmingNumStrokes:
              entry?.distance_data?.swimming?.num_strokes ?? null,
            swimmingNumLaps: entry?.distance_data?.swimming?.num_laps ?? null,
            swimmingPoolLengthMeters:
              entry?.distance_data?.swimming?.pool_length_meters ?? null,
            floorsClimbed: entry?.distance_data?.floors_climbed ?? null,
            elevationLossActualMeters:
              entry?.distance_data?.elevation?.loss_actual_meters ?? null,
            elevationMinMeters:
              entry?.distance_data?.elevation?.min_meters ?? null,
            elevationAvgMeters:
              entry?.distance_data?.elevation?.avg_meters ?? null,
            elevationGainActualMeters:
              entry?.distance_data?.elevation?.gain_actual_meters ?? null,
            elevationMaxMeters:
              entry?.distance_data?.elevation?.max_meters ?? null,
            elevationGainPlannedMeters:
              entry?.distance_data?.elevation?.gain_planned_meters ?? null,
            steps: entry?.distance_data?.steps ?? null,
            distance: entry?.distance_data?.distance_meters ?? null,
            numLowIntensityMinutes:
              entry?.MET_data?.num_low_intensity_minutes ?? null,
            numHighIntensityMinutes:
              entry?.MET_data?.num_high_intensity_minutes ?? null,
            numInactiveMinutes: entry?.MET_data?.num_inactive_minutes ?? null,
            numModerateIntensityMinutes:
              entry?.MET_data?.num_moderate_intensity_minutes ?? null,
            avgLevel: entry?.MET_data?.avg_level ?? null,
            totalCalories: entry?.calories_data?.total_burned_calories ?? null,
            maxHrBpm: entry?.heart_rate_data?.summary?.max_hr_bpm ?? null,
            minHrBpm: entry?.heart_rate_data?.summary?.min_hr_bpm ?? null,
            restingHrBpm:
              entry?.heart_rate_data?.summary?.resting_hr_bpm ?? null,
            avgHrBpm: entry?.heart_rate_data?.summary?.avg_hr_bpm ?? null,
            avgHrv: entry?.heart_rate_data?.summary?.avg_hrv_sdnn
              ? entry?.heart_rate_data?.summary?.avg_hrv_sdnn
              : entry?.heart_rate_data?.summary?.avg_hrv_sdnn
                ? entry?.heart_rate_data?.summary?.avg_hrv_sdnn
                : null,
            activeSeconds:
              entry?.active_durations_data?.activity_seconds ?? null,
            restSeconds: entry?.active_durations_data?.rest_seconds ?? null,
            lowIntensitySeconds:
              entry?.active_durations_data?.low_intensity_seconds ?? null,
            vigorousIntensitySeconds:
              entry?.active_durations_data?.vigorous_intensity_seconds ?? null,
            numContinuousInactivePeriods:
              entry?.active_durations_data?.num_continuous_inactive_periods ??
              null,
            inactivitySeconds:
              entry?.active_durations_data?.inactivity_seconds ?? null,
            moderateIntensitySeconds:
              entry?.active_durations_data?.moderate_intensity_seconds ?? null,
            standingSeconds:
              entry?.active_durations_data?.standing_seconds ?? null,
          },
          date: entry.metadata.start_time,
        };
      } else {
        // entry is treated as Sleep here
        return {
          data: {
            durationInBedSeconds:
              entry?.sleep_durations_data?.other?.duration_in_bed_seconds ??
              null,
            durationUnmeasurableSleepSeconds:
              entry?.sleep_durations_data?.other
                ?.duration_unmeasurable_sleep_seconds ?? null,
            sleepEfficiency:
              entry?.sleep_durations_data?.sleep_efficiency ?? null,
            durationShortInterruptionSeconds:
              entry?.sleep_durations_data?.awake
                ?.duration_short_interruption_seconds ?? null,
            durationAwakeStateSeconds:
              entry?.sleep_durations_data?.awake
                ?.duration_awake_state_seconds ?? null,
            durationLongInterruptionSeconds:
              entry?.sleep_durations_data?.awake
                ?.duration_long_interruption_seconds ?? null,
            numWakeupEvents:
              entry?.sleep_durations_data?.awake?.num_wakeup_events ?? null,
            durationLightSleepStateSeconds:
              entry?.sleep_durations_data?.asleep
                ?.duration_light_sleep_state_seconds ?? null,
            durationAsleepStateSeconds:
              entry?.sleep_durations_data?.asleep
                ?.duration_asleep_state_seconds ?? null,
            numRemEvents:
              entry?.sleep_durations_data?.asleep?.num_REM_events ?? null,
            durationDeepSleepStateSeconds:
              entry?.sleep_durations_data?.asleep
                ?.duration_deep_sleep_state_seconds ?? null,
            temperatureDelta: entry?.temperature_data?.delta ?? null,
            readinessScore: entry?.readiness_data?.readiness ?? null,
            minBreathsPerMinute:
              entry?.respiration_data?.breaths_data?.min_breaths_per_min ??
              null,
            averageBreathsPerMinute:
              entry?.respiration_data?.breaths_data?.avg_breaths_per_min ??
              null,
            maxBreathsPerMinute:
              entry?.respiration_data?.breaths_data?.max_breaths_per_min ??
              null,
            numSnoringEvents:
              entry?.respiration_data?.snoring_data?.num_snoring_events ?? null,
            totalSnoringDurationSeconds:
              entry?.respiration_data?.snoring_data
                ?.total_snoring_duration_seconds ?? null,
          },
          date: entry.metadata.start_time,
        };
      }
    })
    .sort((a, b) => (dayjs(a.date).isBefore(dayjs(b.date)) ? -1 : 1));
};

export const getTrendsTimeFrameIos = async (
  userId: string,
  startDate: string,
  endDate: string,
  limit: number,
  daysToFetch: number,
): Promise<TrendsResponse[] | 'Unauthenticated' | null> => {
  const dailyData = await getDaily(
    Connections.APPLE_HEALTH,
    dayjs(startDate).toDate(),
    dayjs(endDate).toDate(),
    false,
  );

  if (dailyData.error && dailyData.error === 'Unauthenticated')
    return 'Unauthenticated';
  const sleepData = await getSleep(
    Connections.APPLE_HEALTH,
    dayjs(startDate).toDate(),
    dayjs(endDate).toDate(),
    false,
  );
  if (sleepData.error && sleepData.error === 'Unauthenticated')
    return 'Unauthenticated';

  // Check if dailyData.data.data and sleepData.data.data are less than daysToFetch
  if (
    ((dailyData.data as DataMessage).data as Daily[]).length < daysToFetch &&
    ((sleepData.data as DataMessage).data as Sleep[]).length < daysToFetch
  ) {
    return null;
  }

  const dailyDataResponse = extractResponse(dailyData, limit);
  const sleepDataResponse = extractResponse(sleepData, limit);

  // loop through both dailyDataDbResponse and sleepDataDbResponse, and extract the unique keys that are present
  // only add the key if in at least one of the arrays the value is not null/undefined
  // TODO: this is not successfully filtering out all null values, but this behavior is caught on line 124 in TrendsScreen
  const trendNames: string[] = [];
  Object.keys(trendsMap).forEach(key => {
    const isNotNullInDailyData = dailyDataResponse.some(
      record =>
        record.data &&
        record.data[key as keyof typeof record.data] !== null &&
        record.data[key as keyof typeof record.data] !== undefined,
    );
    const isNotNullInSleepData = sleepDataResponse.some(
      record =>
        record.data &&
        record.data[key as keyof typeof record.data] !== null &&
        record.data[key as keyof typeof record.data] !== undefined,
    );
    if (
      isNotNullInDailyData ||
      isNotNullInSleepData ||
      key === 'timeAboveLimit'
    ) {
      trendNames.push(trendsMap[key as keyof typeof trendsMap]);
    }
  });

  const trendsDataArray: TrendsResponse[] = [];
  for (let i = 0; i < daysToFetch; i++) {
    const dailyDataEntry = dailyDataResponse[i]?.data || null;
    const sleepDataEntry = sleepDataResponse[i]?.data || null;

    const trendsResponse: TrendsResponse = {} as TrendsResponse;
    // console log time above limit
    trendNames.forEach(trendName => {
      trendsResponse.date = dailyDataResponse[i].date;
      const key = Object.keys(trendsMap).find(
        k => trendsMap[k as keyof typeof trendsMap] === trendName,
      );
      if (key) {
        trendsResponse[trendName] = {
          value:
            Number(dailyDataEntry?.[key as keyof typeof dailyDataEntry]) ||
            Number(sleepDataEntry?.[key as keyof typeof sleepDataEntry]) ||
            null,
          category: trendsCategoryMap[
            trendName as keyof typeof trendsCategoryMap
          ] as 'Activity' | 'Heart' | 'Sleep',
        };
      }
    });

    trendsDataArray.push(trendsResponse);
  }

  return trendsDataArray;
};
