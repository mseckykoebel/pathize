import {useMemo} from 'react';

import {getTimeAboveLimit} from '@pathize/lib';
import {PathizeMetadata, PathizeDataMap} from '../../../contexts';

export const usePacingDetails = (
  data: PathizeDataMap | undefined,
  limit: number | null,
  currentSelectedDayData: PathizeMetadata | undefined,
) => {
  ////
  // AVERAGE DATA
  // TODO: TOL currently broken because there is no heartRateSamples being saved
  ////

  /**
   * @description the average time spent above limit over the past 30 days
   */
  const averageTimeAboveLimitPast30Days = useMemo(() => {
    if (!data || !limit) return null;
    const past30DaysKeys = Object.keys(data)
      .sort((a, b) => b.localeCompare(a))
      .slice(0, 30);
    const past30Days = past30DaysKeys.map(key => data[key]);
    let hrSamplesAvailable = 0;
    let cumulativeTimeAboveLimit = 0;
    for (const day of past30Days) {
      if (
        day.metadata?.heartRateSamples &&
        day.metadata.heartRateSamples.length > 0
      ) {
        hrSamplesAvailable++;

        cumulativeTimeAboveLimit += getTimeAboveLimit(
          day.metadata.heartRateSamples,
          limit,
        );
      }
    }

    if (hrSamplesAvailable === 0) return null;
    return Math.trunc(cumulativeTimeAboveLimit / hrSamplesAvailable);
  }, [data, limit]);

  /**
   * @description the average resting heart rate over the past 30 days
   */
  const averageMaxHrPast30Days = useMemo(() => {
    if (!data) return null;
    const past30DaysKeys = Object.keys(data)
      .sort((a, b) => b.localeCompare(a))
      .slice(0, 30);
    const past30Days = past30DaysKeys.map(key => data[key]);
    let hrSamplesAvailable = 0;
    let cumulativeMaxHr = 0;
    for (const day of past30Days) {
      if (day.metadata?.maxHr) {
        hrSamplesAvailable++;
        cumulativeMaxHr += day.metadata.maxHr;
      }
    }

    if (hrSamplesAvailable === 0) return null;
    return Math.trunc(cumulativeMaxHr / hrSamplesAvailable);
  }, [data]);

  /**
   * @description the average resting heart rate over the past 30 days
   */
  const averageMinHrPast30Days = useMemo(() => {
    if (!data) return null;
    const past30DaysKeys = Object.keys(data)
      .sort((a, b) => b.localeCompare(a))
      .slice(0, 30);
    const past30Days = past30DaysKeys.map(key => data[key]);
    let hrSamplesAvailable = 0;
    let cumulativeMinHr = 0;
    for (const day of past30Days) {
      if (day.metadata?.minHr) {
        hrSamplesAvailable++;
        cumulativeMinHr += day.metadata.minHr;
      }
    }

    if (hrSamplesAvailable === 0) return null;
    return Math.trunc(cumulativeMinHr / hrSamplesAvailable);
  }, [data]);

  /**
   * @description the average resting heart rate over the past 30 days
   */
  const averageHrvPast30Days = useMemo(() => {
    if (!data) return null;
    const past30DaysKeys = Object.keys(data)
      .sort((a, b) => b.localeCompare(a))
      .slice(0, 30);
    const past30Days = past30DaysKeys.map(key => data[key]);
    let hrSamplesAvailable = 0;
    let cumulativeHrv = 0;
    for (const day of past30Days) {
      if (day.metadata?.hrv) {
        hrSamplesAvailable++;
        cumulativeHrv += day.metadata.hrv;
      }
    }

    if (hrSamplesAvailable === 0) return null;
    return Math.trunc(cumulativeHrv / hrSamplesAvailable);
  }, [data]);

  /**
   * @description the average resting heart rate over the past 30 days
   */
  const averageRhrPast30Days = useMemo(() => {
    if (!data) return null;
    const past30DaysKeys = Object.keys(data)
      .sort((a, b) => b.localeCompare(a))
      .slice(0, 30);
    const past30Days = past30DaysKeys.map(key => data[key]);
    let hrSamplesAvailable = 0;
    let cumulativeRhr = 0;
    for (const day of past30Days) {
      if (day.metadata?.restingHr) {
        hrSamplesAvailable++;
        cumulativeRhr += day.metadata.restingHr;
      }
    }

    if (hrSamplesAvailable === 0) return null;
    return Math.trunc(cumulativeRhr / hrSamplesAvailable);
  }, [data]);

  /**
   * @description the average time spent standing over the past 30 days
   */
  const averageTimeStandingPast30Days = useMemo(() => {
    if (!data) return null;
    const past30DaysKeys = Object.keys(data)
      .sort((a, b) => b.localeCompare(a))
      .slice(0, 30);
    const past30Days = past30DaysKeys.map(key => data[key]);
    let hrSamplesAvailable = 0;
    let cumulativeTimeStanding = 0;
    for (const day of past30Days) {
      if (day.metadata?.timeStanding) {
        hrSamplesAvailable++;
        cumulativeTimeStanding += day.metadata.timeStanding;
      }
    }

    if (hrSamplesAvailable === 0) return null;
    return Math.trunc(cumulativeTimeStanding / hrSamplesAvailable);
  }, [data]);

  /**
   * @description the average time in deep sleep over the past 30 days
   */
  const averageTimeDeepSleepPast30Days = useMemo(() => {
    if (!data) return null;
    const past30DaysKeys = Object.keys(data)
      .sort((a, b) => b.localeCompare(a))
      .slice(0, 30);
    const past30Days = past30DaysKeys.map(key => data[key]);
    let hrSamplesAvailable = 0;
    let cumulativeTimeDeepSleep = 0;
    for (const day of past30Days) {
      if (day.metadata?.timeInDeepSleep) {
        hrSamplesAvailable++;
        cumulativeTimeDeepSleep += day.metadata.timeInDeepSleep;
      }
    }

    if (hrSamplesAvailable === 0) return null;
    return Math.trunc(cumulativeTimeDeepSleep / hrSamplesAvailable);
  }, [data]);

  /**
   * @description the average time in REM sleep over the past 30 days
   */
  const averageTimeRemSleepPast30Days = useMemo(() => {
    if (!data) return null;
    const past30DaysKeys = Object.keys(data)
      .sort((a, b) => b.localeCompare(a))
      .slice(0, 30);
    const past30Days = past30DaysKeys.map(key => data[key]);
    let hrSamplesAvailable = 0;
    let cumulativeTimeRemSleep = 0;
    for (const day of past30Days) {
      if (day.metadata?.timeInREMSleep) {
        hrSamplesAvailable++;
        cumulativeTimeRemSleep += day.metadata.timeInREMSleep;
      }
    }

    if (hrSamplesAvailable === 0) return null;
    return Math.trunc(cumulativeTimeRemSleep / hrSamplesAvailable);
  }, [data]);

  /**
   * @description the average nighttime HRV over the last 30 days
   */
  const averageNighttimeHrvPast30Days = useMemo(() => {
    if (!data) return null;
    const past30DaysKeys = Object.keys(data)
      .sort((a, b) => b.localeCompare(a))
      .slice(0, 30);
    const past30Days = past30DaysKeys.map(key => data[key]);
    let hrSamplesAvailable = 0;
    let cumulativeNighttimeHrv = 0;
    for (const day of past30Days) {
      if (day.metadata?.nighttimeHrv) {
        hrSamplesAvailable++;
        cumulativeNighttimeHrv += day.metadata.nighttimeHrv;
      }
    }

    if (hrSamplesAvailable === 0) return null;
    return Math.trunc(cumulativeNighttimeHrv / hrSamplesAvailable);
  }, [data]);

  /**
   * @description the average steps over the past 30 days
   */
  const averageStepsPast30Days = useMemo(() => {
    if (!data) return null;
    const past30DaysKeys = Object.keys(data)
      .sort((a, b) => b.localeCompare(a))
      .slice(0, 30);
    const past30Days = past30DaysKeys.map(key => data[key]);
    let stepsAvailable = 0;
    let cumulativeSteps = 0;
    for (const day of past30Days) {
      if (day.metadata?.steps) {
        stepsAvailable++;
        cumulativeSteps += day.metadata.steps;
      }
    }

    if (stepsAvailable === 0) return null;
    return Math.trunc(cumulativeSteps / stepsAvailable);
  }, [data]);

  ////
  // PERCENTAGE
  ///

  const percentageOfTimeAboveLimitPast30Days = useMemo(() => {
    if (!averageTimeAboveLimitPast30Days || !currentSelectedDayData)
      return null;
    return Math.trunc(
      ((currentSelectedDayData?.timeAboveLimit -
        averageTimeAboveLimitPast30Days) /
        averageTimeAboveLimitPast30Days) *
        100,
    );
  }, [averageTimeAboveLimitPast30Days, currentSelectedDayData]);

  const percentageOfMaxHrPast30Days = useMemo(() => {
    if (!averageMaxHrPast30Days || !currentSelectedDayData?.maxHr) return null;
    return Math.trunc(
      ((currentSelectedDayData.maxHr - averageMaxHrPast30Days) /
        averageMaxHrPast30Days) *
        100,
    );
  }, [averageMaxHrPast30Days, currentSelectedDayData]);

  const percentageOfMinHrPast30Days = useMemo(() => {
    if (!averageMinHrPast30Days || !currentSelectedDayData?.minHr) return null;
    return Math.trunc(
      ((currentSelectedDayData.minHr - averageMinHrPast30Days) /
        averageMinHrPast30Days) *
        100,
    );
  }, [averageMinHrPast30Days, currentSelectedDayData]);

  // HRV
  const percentageOfHrvPast30Days = useMemo(() => {
    if (!averageHrvPast30Days || !currentSelectedDayData?.hrv) return null;
    return Math.trunc(
      ((currentSelectedDayData.hrv - averageHrvPast30Days) /
        averageHrvPast30Days) *
        100,
    );
  }, [averageHrvPast30Days, currentSelectedDayData]);

  // RHR
  const percentageOfRhrPast30Days = useMemo(() => {
    if (!averageRhrPast30Days || !currentSelectedDayData?.restingHr)
      return null;
    return Math.trunc(
      ((currentSelectedDayData.restingHr - averageRhrPast30Days) /
        averageRhrPast30Days) *
        100,
    );
  }, [averageRhrPast30Days, currentSelectedDayData]);

  // Time standing
  const percentageOfTimeStandingPast30Days = useMemo(() => {
    if (!averageTimeStandingPast30Days || !currentSelectedDayData?.timeStanding)
      return null;
    return Math.trunc(
      ((currentSelectedDayData.timeStanding - averageTimeStandingPast30Days) /
        averageTimeStandingPast30Days) *
        100,
    );
  }, [averageTimeStandingPast30Days, currentSelectedDayData]);

  // Time in deep sleep
  const percentageOfTimeDeepSleepPast30Days = useMemo(() => {
    if (
      !averageTimeDeepSleepPast30Days ||
      !currentSelectedDayData?.timeInDeepSleep
    )
      return null;
    return Math.trunc(
      ((currentSelectedDayData.timeInDeepSleep -
        averageTimeDeepSleepPast30Days) /
        averageTimeDeepSleepPast30Days) *
        100,
    );
  }, [averageTimeDeepSleepPast30Days, currentSelectedDayData]);

  // Time in REM sleep
  const percentageOfTimeRemSleepPast30Days = useMemo(() => {
    if (
      !averageTimeRemSleepPast30Days ||
      !currentSelectedDayData?.timeInREMSleep
    )
      return null;
    return Math.trunc(
      ((currentSelectedDayData.timeInREMSleep - averageTimeRemSleepPast30Days) /
        averageTimeRemSleepPast30Days) *
        100,
    );
  }, [averageTimeRemSleepPast30Days, currentSelectedDayData]);

  // Nighttime HRV
  const percentageOfNighttimeHrvPast30Days = useMemo(() => {
    if (!averageNighttimeHrvPast30Days || !currentSelectedDayData?.nighttimeHrv)
      return null;
    return Math.trunc(
      ((currentSelectedDayData.nighttimeHrv - averageNighttimeHrvPast30Days) /
        averageNighttimeHrvPast30Days) *
        100,
    );
  }, [averageNighttimeHrvPast30Days, currentSelectedDayData]);

  // Steps
  const percentageOfStepsPast30Days = useMemo(() => {
    if (!averageStepsPast30Days || !currentSelectedDayData?.steps) return null;
    return Math.trunc(
      ((currentSelectedDayData.steps - averageStepsPast30Days) /
        averageStepsPast30Days) *
        100,
    );
  }, [averageStepsPast30Days, currentSelectedDayData]);

  ////
  // RETURN ALL OF THESE
  ////

  return {
    percentageOfTimeAboveLimitPast30Days,
    percentageOfMaxHrPast30Days,
    percentageOfMinHrPast30Days,
    percentageOfHrvPast30Days,
    percentageOfRhrPast30Days,
    percentageOfTimeStandingPast30Days,
    percentageOfTimeDeepSleepPast30Days,
    percentageOfTimeRemSleepPast30Days,
    percentageOfNighttimeHrvPast30Days,
    percentageOfStepsPast30Days,
  };
};
