import {symptomConvert, timeConvert} from '../utils';
import {
  formatDistance,
  formatHr,
  formatHrv,
  formatIndividualTimes,
  formatMetersToFeet,
  formatPercentage,
  formatSteps,
  formatVo2Max,
} from '../components/chart/utils';

// time convert but arg is in minutes and not seconds
function timeConvertMinutes(n: number) {
  'worklet';
  var hours = n / 60;
  var rhours = Math.floor(hours);
  var minutes = (hours - rhours) * 60;
  var rminutes = Math.round(minutes);
  return rhours + 'h ' + rminutes + 'm';
}

export function getYAxisModifier(key: string): (value: number) => string {
  switch (key) {
    case 'timeAboveLimit':
      return timeConvert;
    case 'averageSaturationPercentage':
      return formatPercentage;
    case 'vO2Max':
      return formatVo2Max;
    case 'recoveryScore':
      return formatIndividualTimes;
    case 'activityScore':
      return formatIndividualTimes;
    case 'sleepScore':
      return formatIndividualTimes;
    case 'swimmingNumberOfStrokes':
      return formatIndividualTimes;
    case 'swimmingNumberOfLaps':
      return formatIndividualTimes;
    case 'swimmingPoolLengthMeters':
      return formatMetersToFeet;
    case 'floorsClimbed':
      return formatIndividualTimes;
    case 'elevationLossMeters':
      return formatMetersToFeet;
    case 'minimumElevationMeters':
      return formatMetersToFeet;
    case 'averageElevationMeters':
      return formatMetersToFeet;
    case 'elevationGainMeters':
      return formatMetersToFeet;
    case 'maximumElevationMeters':
      return formatMetersToFeet;
    case 'elevationGainPlannedMeters':
      return formatMetersToFeet;
    case 'steps':
      return formatSteps;
    case 'distance':
      return formatDistance;
    case 'lowIntensityTime':
      return timeConvertMinutes;
    case 'highIntensityTime':
      return timeConvertMinutes;
    case 'inactiveTime':
      return timeConvertMinutes;
    case 'moderateIntensityTime':
      return timeConvertMinutes;
    case 'averageActivityLevel':
      return formatIndividualTimes;
    case 'calories':
      return formatIndividualTimes;
    case 'maximumHeartRate':
      return formatHr;
    case 'minimumHeartRate':
      return formatHr;
    case 'restingHeartRate':
      return formatHr;
    case 'averageHeartRate':
      return formatHr;
    case 'averageHrv':
      return formatHrv;
    case 'timeActive':
      return timeConvert;
    case 'timeResting':
      return timeConvert;
    case 'amountOfLowIntensityWork':
      return timeConvert;
    case 'amountOfVigorousIntensityWork':
      return timeConvert;
    case 'numberOfContinuousInactivePeriods':
      return formatIndividualTimes;
    case 'totalTimeInactive':
      return timeConvert;
    case 'totalModerateIntensityTime':
      return timeConvert;
    case 'timeSpentStanding':
      return timeConvert;
    case 'timeInBed':
      return timeConvert;
    case 'undeterminedSleepStageTime':
      return timeConvert;
    case 'sleepEfficiency':
      return formatPercentage;
    case 'totalShortInterruptedTime':
      return timeConvert;
    case 'timeAwake':
      return timeConvert;
    case 'totalLongInterruptedTime':
      return timeConvert;
    case 'numberOfTimesAwareInTheNight':
      return formatIndividualTimes;
    case 'timeInLightSleep':
      return timeConvert;
    case 'timeAsleep':
      return timeConvert;
    case 'numberOfREMEvents':
      return formatIndividualTimes;
    case 'timeInDeepSleep':
      return timeConvert;
    case 'temperature':
      return formatIndividualTimes;
    case 'readinessScore':
      return formatIndividualTimes;
    case 'minimumBreathsPerMinute':
      return formatIndividualTimes;
    case 'averageBreathsPerMinute':
      return formatIndividualTimes;
    case 'maximumBreathsPerMinute':
      return formatIndividualTimes;
    case 'numberOfSnoringEvents':
      return formatIndividualTimes;
    case 'totalTimeSnoring':
      return timeConvert;
    case 'symptom':
      return symptomConvert;
    default:
      throw new Error(`Unknown key: ${key}`) as never;
  }
}
