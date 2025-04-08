import dayjs from 'dayjs';

import {Crash} from '@pathize/db';
import {removeDuplicateCrashes, getTimeAboveLimit} from '@pathize/lib';
import {PathizeDataMap, PathizeExertionGuidance} from '../PathizeDataContext';

export function getEnergyBudgetStats(
  allRecordedCrashes: Crash[],
  allData: PathizeDataMap,
  heartRateLimit: number,
): PathizeExertionGuidance {
  const filteredCrashes = removeDuplicateCrashes(allRecordedCrashes);

  // 1) TIME ABOVE LIMIT
  let timeAboveLimit = 0;
  let periodsWhereTimeAboveLimitDataPresent = 0;
  let averageTimeAboveLimitForPeriod = 0;
  // 2) MAX HR
  let maxHr = 0;
  let maxHrUpperBound: number | undefined;
  let maxHrLowerBound: number | undefined;
  let periodsWhereMaxHrDataPresent = 0;
  let averageMaxHrForPeriod = 0;
  // 3) MIN HR
  let minHr = 0;
  let minHrUpperBound: number | undefined;
  let minHrLowerBound: number | undefined;
  let periodsWhereMinHrDataPresent = 0;
  let averageMinHrForPeriod = 0;
  // 4) RESTING HR
  let restingHr = 0;
  let restingHrUpperBound: number | undefined;
  let restingHrLowerBound: number | undefined;
  let periodsWhereRestingHrDataPresent = 0;
  let averageRestingHrForPeriod = 0;
  // 5) HRV
  let hrv = 0;
  let hrvUpperBound: number | undefined;
  let hrvLowerBound: number | undefined;
  let periodsWhereHrvDataPresent = 0;
  let averageHrvForPeriod = 0;
  // 6) TIME STANDING
  let timeStanding = 0;
  let timeStandingUpperBound: number | undefined;
  let timeStandingLowerBound: number | undefined;
  let periodsWhereTimeStandingDataPresent = 0;
  let averageTimeStandingForPeriod = 0;
  // 7) TIME IN DEEP SLEEP
  let timeInDeepSleep = 0;
  let timeInDeepSleepUpperBound: number | undefined;
  let timeInDeepSleepLowerBound: number | undefined;
  let periodsWhereTimeInDeepSleepDataPresent = 0;
  let averageTimeInDeepSleepForPeriod = 0;
  // 8) TIME IN REM SLEEP
  let timeInREMSleep = 0;
  let timeInREMSleepUpperBound: number | undefined;
  let timeInREMSleepLowerBound: number | undefined;
  let periodsWhereTimeInREMSleepDataPresent = 0;
  let averageTimeInREMSleepForPeriod = 0;
  // 9) NIGHT TIME HRV
  let nightTimeHrv = 0;
  let nightTimeHrvUpperBound: number | undefined;
  let nightTimeHrvLowerBound: number | undefined;
  let periodsWhereNightTimeHrvDataPresent = 0;
  let averageNightTimeHrvForPeriod = 0;
  // 10) STEPS
  let steps = 0;
  let stepsUpperBound: number | undefined;
  let stepsLowerBound: number | undefined;
  let periodsWhereStepsDataPresent = 0;
  let averageStepsForPeriod = 0;

  for (const crash of filteredCrashes) {
    const crashDay = crash.createdDay;

    // find the dailyData that lines up with the crash createdDay, and if one does not, skip it entirely
    const dailyDataForDay = Object.values(allData).find(
      d => d.date === crashDay,
    );
    if (!dailyDataForDay) continue;

    // PERFORM CALCULATIONS ON 72-HOUR WINDOWS
    // 1) TIME ABOVE LIMIT
    let numSampleDaysAvailable = 0;
    let timeAboveLimitForPeriod = 0;

    // 2) MAX HR
    let numMaxHrDaysAvailable = 0;
    let maxHrForPeriod = 0;

    // 3) MIN HR
    let numMinHrDaysAvailable = 0;
    let minHrForPeriod = 0;

    // 4) RESTING HR
    let numRestingHrDaysAvailable = 0;
    let restingHrForPeriod = 0;

    // 5) HRV
    let numHrvDaysAvailable = 0;
    let hrvForPeriod = 0;

    // 6) TIME STANDING
    let numTimeStandingDaysAvailable = 0;
    let timeStandingForPeriod = 0;

    // 7) TIME IN DEEP SLEEP
    let numTimeInDeepSleepDaysAvailable = 0;
    let timeInDeepSleepForPeriod = 0;

    // 8) TIME IN REM SLEEP
    let numTimeInREMSleepDaysAvailable = 0;
    let timeInREMSleepForPeriod = 0;

    // 9) NIGHT TIME HRV
    let numNightTimeHrvDaysAvailable = 0;
    let nightTimeHrvForPeriod = 0;

    // 10) STEPS
    let numStepsDaysAvailable = 0;
    let stepsForPeriod = 0;

    // LOOP THROUGH DATA
    const dailyDataDay = dailyDataForDay.date;
    for (let i = 0; i <= 2; i++) {
      // 72-hour block
      const currentDay = dayjs(dailyDataDay)
        .subtract(i, 'day')
        .format('YYYY-MM-DD');
      const currentDayData = allData[currentDay];
      const currentDayHeartRateSamples =
        currentDayData?.metadata?.heartRateSamples;

      // 1) TIME ABOVE LIMIT
      if (currentDayHeartRateSamples && currentDayHeartRateSamples.length > 0) {
        // iterate the numerator, overall TOL for period
        timeAboveLimitForPeriod += getTimeAboveLimit(
          currentDayHeartRateSamples,
          heartRateLimit,
        );
        // iterate denominator, number of days with samples
        numSampleDaysAvailable++;
      }

      // 2) MAX HR
      if (currentDayData?.metadata?.maxHr) {
        maxHrForPeriod += currentDayData.metadata.maxHr;
        numMaxHrDaysAvailable++;

        // update upper and lower bounds of maxHR
        if (
          maxHrUpperBound === undefined ||
          currentDayData.metadata.maxHr > maxHrUpperBound
        ) {
          maxHrUpperBound = currentDayData.metadata.maxHr;
        }

        if (
          maxHrLowerBound === undefined ||
          currentDayData.metadata.maxHr < maxHrLowerBound
        ) {
          maxHrLowerBound = currentDayData.metadata.maxHr;
        }
      }

      // 3) MIN HR
      if (currentDayData?.metadata?.minHr) {
        minHrForPeriod += currentDayData.metadata.minHr;
        numMinHrDaysAvailable++;

        // update upper and lower bounds of minHR
        if (
          minHrUpperBound === undefined ||
          currentDayData.metadata.minHr > minHrUpperBound
        ) {
          minHrUpperBound = currentDayData.metadata.minHr;
        }

        if (
          minHrLowerBound === undefined ||
          currentDayData.metadata.minHr < minHrLowerBound
        ) {
          minHrLowerBound = currentDayData.metadata.minHr;
        }
      }

      // 4) RESTING HR
      if (currentDayData?.metadata?.restingHr) {
        restingHrForPeriod += currentDayData.metadata.restingHr;
        numRestingHrDaysAvailable++;

        // update upper and lower bounds of restingHR
        if (
          restingHrUpperBound === undefined ||
          currentDayData.metadata.restingHr > restingHrUpperBound
        ) {
          restingHrUpperBound = currentDayData.metadata.restingHr;
        }

        if (
          restingHrLowerBound === undefined ||
          currentDayData.metadata.restingHr < restingHrLowerBound
        ) {
          restingHrLowerBound = currentDayData.metadata.restingHr;
        }
      }

      // 5) HRV
      if (currentDayData?.metadata?.hrv) {
        hrvForPeriod += currentDayData.metadata.hrv;
        numHrvDaysAvailable++;

        // update upper and lower bounds of HRV
        if (
          hrvUpperBound === undefined ||
          currentDayData.metadata.hrv > hrvUpperBound
        ) {
          hrvUpperBound = currentDayData.metadata.hrv;
        }

        if (
          hrvLowerBound === undefined ||
          currentDayData.metadata.hrv < hrvLowerBound
        ) {
          hrvLowerBound = currentDayData.metadata.hrv;
        }
      }

      // 6) TIME STANDING
      if (currentDayData?.metadata?.timeStanding) {
        timeStandingForPeriod += currentDayData.metadata.timeStanding;
        numTimeStandingDaysAvailable++;

        // update upper and lower bounds of time standing
        if (
          timeStandingUpperBound === undefined ||
          currentDayData.metadata.timeStanding > timeStandingUpperBound
        ) {
          timeStandingUpperBound = currentDayData.metadata.timeStanding;
        }

        if (
          timeStandingLowerBound === undefined ||
          currentDayData.metadata.timeStanding < timeStandingLowerBound
        ) {
          timeStandingLowerBound = currentDayData.metadata.timeStanding;
        }
      }

      // 7) TIME IN DEEP SLEEP
      if (currentDayData?.metadata?.timeInDeepSleep) {
        timeInDeepSleepForPeriod += currentDayData.metadata.timeInDeepSleep;
        numTimeInDeepSleepDaysAvailable++;

        // update upper and lower bounds of time in deep sleep
        if (
          timeInDeepSleepUpperBound === undefined ||
          currentDayData.metadata.timeInDeepSleep > timeInDeepSleepUpperBound
        ) {
          timeInDeepSleepUpperBound = currentDayData.metadata.timeInDeepSleep;
        }

        if (
          timeInDeepSleepLowerBound === undefined ||
          currentDayData.metadata.timeInDeepSleep < timeInDeepSleepLowerBound
        ) {
          timeInDeepSleepLowerBound = currentDayData.metadata.timeInDeepSleep;
        }
      }

      // 8) TIME IN REM SLEEP
      if (currentDayData?.metadata?.timeInREMSleep) {
        timeInREMSleepForPeriod += currentDayData.metadata.timeInREMSleep;
        numTimeInREMSleepDaysAvailable++;

        // update upper and lower bounds of time in REM sleep
        if (
          timeInREMSleepUpperBound === undefined ||
          currentDayData.metadata.timeInREMSleep > timeInREMSleepUpperBound
        ) {
          timeInREMSleepUpperBound = currentDayData.metadata.timeInREMSleep;
        }

        if (
          timeInREMSleepLowerBound === undefined ||
          currentDayData.metadata.timeInREMSleep < timeInREMSleepLowerBound
        ) {
          timeInREMSleepLowerBound = currentDayData.metadata.timeInREMSleep;
        }
      }

      // 9) NIGHT TIME HRV
      if (currentDayData?.metadata?.nighttimeHrv) {
        nightTimeHrvForPeriod += currentDayData.metadata.nighttimeHrv;
        numNightTimeHrvDaysAvailable++;

        // update upper and lower bounds of night time HRV
        if (
          nightTimeHrvUpperBound === undefined ||
          currentDayData.metadata.nighttimeHrv > nightTimeHrvUpperBound
        ) {
          nightTimeHrvUpperBound = currentDayData.metadata.nighttimeHrv;
        }

        if (
          nightTimeHrvLowerBound === undefined ||
          currentDayData.metadata.nighttimeHrv < nightTimeHrvLowerBound
        ) {
          nightTimeHrvLowerBound = currentDayData.metadata.nighttimeHrv;
        }
      }

      // 10) STEPS
      if (currentDayData?.metadata?.steps) {
        stepsForPeriod += currentDayData.metadata.steps;
        numStepsDaysAvailable++;

        // update upper and lower bounds of steps
        if (
          stepsUpperBound === undefined ||
          currentDayData.metadata.steps > stepsUpperBound
        ) {
          stepsUpperBound = currentDayData.metadata.steps;
        }

        if (
          stepsLowerBound === undefined ||
          currentDayData.metadata.steps < stepsLowerBound
        ) {
          stepsLowerBound = currentDayData.metadata.steps;
        }
      }
    }

    // 1) TIME ABOVE LIMIT (determine average for period, add to overall TOL, if there is data)
    if (numSampleDaysAvailable > 0) {
      periodsWhereTimeAboveLimitDataPresent++;

      averageTimeAboveLimitForPeriod =
        timeAboveLimitForPeriod / numSampleDaysAvailable;
      timeAboveLimit += averageTimeAboveLimitForPeriod;
    }

    // 2) MAX HR (determine average for period, add to overall max HR, if there is data)
    if (numMaxHrDaysAvailable > 0) {
      periodsWhereMaxHrDataPresent++;

      averageMaxHrForPeriod = maxHrForPeriod / numMaxHrDaysAvailable;
      maxHr += averageMaxHrForPeriod;
    }

    // 3) MIN HR (determine average for period, add to overall min HR, if there is data)
    if (numMinHrDaysAvailable > 0) {
      periodsWhereMinHrDataPresent++;

      averageMinHrForPeriod = minHrForPeriod / numMinHrDaysAvailable;
      minHr += averageMinHrForPeriod;
    }

    // 4) RESTING HR (determine average for period, add to overall resting HR, if there is data)
    if (numRestingHrDaysAvailable > 0) {
      periodsWhereRestingHrDataPresent++;

      averageRestingHrForPeriod =
        restingHrForPeriod / numRestingHrDaysAvailable;
      restingHr += averageRestingHrForPeriod;
    }

    // 5) HRV (determine average for period, add to overall HRV, if there is data)
    if (numHrvDaysAvailable > 0) {
      periodsWhereHrvDataPresent++;

      averageHrvForPeriod = hrvForPeriod / numHrvDaysAvailable;
      hrv += averageHrvForPeriod;
    }

    // 6) TIME STANDING (determine average for period, add to overall time standing, if there is data)
    if (numTimeStandingDaysAvailable > 0) {
      periodsWhereTimeStandingDataPresent++;

      averageTimeStandingForPeriod =
        timeStandingForPeriod / numTimeStandingDaysAvailable;
      timeStanding += averageTimeStandingForPeriod;
    }

    // 7) TIME IN DEEP SLEEP (determine average for period, add to overall time in deep sleep, if there is data)
    if (numTimeInDeepSleepDaysAvailable > 0) {
      periodsWhereTimeInDeepSleepDataPresent++;

      averageTimeInDeepSleepForPeriod =
        timeInDeepSleepForPeriod / numTimeInDeepSleepDaysAvailable;
      timeInDeepSleep += averageTimeInDeepSleepForPeriod;
    }

    // 8) TIME IN REM SLEEP (determine average for period, add to overall time in REM sleep, if there is data)
    if (numTimeInREMSleepDaysAvailable > 0) {
      periodsWhereTimeInREMSleepDataPresent++;

      averageTimeInREMSleepForPeriod =
        timeInREMSleepForPeriod / numTimeInREMSleepDaysAvailable;
      timeInREMSleep += averageTimeInREMSleepForPeriod;
    }

    // 9) NIGHT TIME HRV (determine average for period, add to overall night time HRV, if there is data)
    if (numNightTimeHrvDaysAvailable > 0) {
      periodsWhereNightTimeHrvDataPresent++;

      averageNightTimeHrvForPeriod =
        nightTimeHrvForPeriod / numNightTimeHrvDaysAvailable;
      nightTimeHrv += averageNightTimeHrvForPeriod;
    }

    // 10) STEPS (determine average for period, add to overall steps, if there is data)
    if (numStepsDaysAvailable > 0) {
      periodsWhereStepsDataPresent++;

      averageStepsForPeriod = stepsForPeriod / numStepsDaysAvailable;
      steps += averageStepsForPeriod;
    }
  }

  const exertionGuidanceData = {
    exertionGuidanceTimeAboveLimit:
      periodsWhereTimeAboveLimitDataPresent > 0
        ? Math.trunc(timeAboveLimit / periodsWhereTimeAboveLimitDataPresent)
        : undefined,
    // max HR
    maxHrDuringPEMUpperBound: maxHrUpperBound && Math.trunc(maxHrUpperBound),
    maxHrDuringPEMLowerBound: maxHrLowerBound && Math.trunc(maxHrLowerBound),
    maxHrDuringPEM:
      periodsWhereMaxHrDataPresent > 0
        ? Math.trunc(maxHr / periodsWhereMaxHrDataPresent)
        : undefined,
    // min HR
    minHrDuringPEMUpperBound: minHrUpperBound && Math.trunc(minHrUpperBound),
    minHrDuringPEMLowerBound: minHrLowerBound && Math.trunc(minHrLowerBound),
    minHrDuringPEM:
      periodsWhereMinHrDataPresent > 0
        ? Math.trunc(minHr / periodsWhereMinHrDataPresent)
        : undefined,
    // resting HR
    restingHrDuringPEMUpperBound:
      restingHrUpperBound && Math.trunc(restingHrUpperBound),
    restingHrDuringPEMLowerBound:
      restingHrLowerBound && Math.trunc(restingHrLowerBound),
    restingHrDuringPEM:
      periodsWhereRestingHrDataPresent > 0
        ? Math.trunc(restingHr / periodsWhereRestingHrDataPresent)
        : undefined,
    // HRV
    hrvDuringPEMUpperBound: hrvUpperBound && Math.trunc(hrvUpperBound),
    hrvDuringPEMLowerBound: hrvLowerBound && Math.trunc(hrvLowerBound),
    hrvDuringPEM:
      periodsWhereHrvDataPresent > 0
        ? Math.trunc(hrv / periodsWhereHrvDataPresent)
        : undefined,
    // time standing
    timeStandingDuringPEMUpperBound:
      timeStandingUpperBound && Math.trunc(timeStandingUpperBound),
    timeStandingDuringPEMLowerBound:
      timeStandingLowerBound && Math.trunc(timeStandingLowerBound),
    timeStandingDuringPEM:
      periodsWhereTimeStandingDataPresent > 0
        ? Math.trunc(timeStanding / periodsWhereTimeStandingDataPresent)
        : undefined,
    // time in deep sleep
    timeInDeepSleepDuringPEMUpperBound:
      timeInDeepSleepUpperBound && Math.trunc(timeInDeepSleepUpperBound),
    timeInDeepSleepDuringPEMLowerBound:
      timeInDeepSleepLowerBound && Math.trunc(timeInDeepSleepLowerBound),
    timeInDeepSleepDuringPEM:
      periodsWhereTimeInDeepSleepDataPresent > 0
        ? Math.trunc(timeInDeepSleep / periodsWhereTimeInDeepSleepDataPresent)
        : undefined,
    // time in REM sleep
    timeInREMSleepDuringPEMUpperBound:
      timeInREMSleepUpperBound && Math.trunc(timeInREMSleepUpperBound),
    timeInREMSleepDuringPEMLowerBound:
      timeInREMSleepLowerBound && Math.trunc(timeInREMSleepLowerBound),
    timeInREMSleepDuringPEM:
      periodsWhereTimeInREMSleepDataPresent > 0
        ? Math.trunc(timeInREMSleep / periodsWhereTimeInREMSleepDataPresent)
        : undefined,
    // night time HRV
    nightTimeHrvDuringPEMUpperBound:
      nightTimeHrvUpperBound && Math.trunc(nightTimeHrvUpperBound),
    nightTimeHrvDuringPEMLowerBound:
      nightTimeHrvLowerBound && Math.trunc(nightTimeHrvLowerBound),
    nightTimeHrvDuringPEM:
      periodsWhereNightTimeHrvDataPresent > 0
        ? Math.trunc(nightTimeHrv / periodsWhereNightTimeHrvDataPresent)
        : undefined,
    // steps
    stepsDuringPEMUpperBound: stepsUpperBound && Math.trunc(stepsUpperBound),
    stepsDuringPEMLowerBound: stepsLowerBound && Math.trunc(stepsLowerBound),
    stepsDuringPEM:
      periodsWhereStepsDataPresent > 0
        ? Math.trunc(steps / periodsWhereStepsDataPresent)
        : undefined,
  } as PathizeExertionGuidance;

  return exertionGuidanceData;
}
