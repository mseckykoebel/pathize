import {symptomConvert, timeConvert} from '../utils';
import {
  formatDistanceNoUnit,
  formatHrNoUnit,
  formatHrvNoUnit,
  formatIndividualTimesNoUnit,
  formatMetersToFeetNoUnit,
  formatPercentageNoUnit,
  formatStepsNoUnit,
  formatVo2MaxNoUnit,
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

export function getYAxisModifierNoUnits(
  key: string,
): (value: number) => string {
  switch (key) {
    case 'timeAboveLimit':
      return timeConvert;
    case 'averageSaturationPercentage':
      return formatPercentageNoUnit;
    case 'vO2Max':
      return formatVo2MaxNoUnit;
    case 'recoveryScore':
      return formatIndividualTimesNoUnit;
    case 'activityScore':
      return formatIndividualTimesNoUnit;
    case 'sleepScore':
      return formatIndividualTimesNoUnit;
    case 'swimmingNumberOfStrokes':
      return formatIndividualTimesNoUnit;
    case 'swimmingNumberOfLaps':
      return formatIndividualTimesNoUnit;
    case 'swimmingPoolLengthMeters':
      return formatMetersToFeetNoUnit;
    case 'floorsClimbed':
      return formatIndividualTimesNoUnit;
    case 'elevationLossMeters':
      return formatMetersToFeetNoUnit;
    case 'minimumElevationMeters':
      return formatMetersToFeetNoUnit;
    case 'averageElevationMeters':
      return formatMetersToFeetNoUnit;
    case 'elevationGainMeters':
      return formatMetersToFeetNoUnit;
    case 'maximumElevationMeters':
      return formatMetersToFeetNoUnit;
    case 'elevationGainPlannedMeters':
      return formatMetersToFeetNoUnit;
    case 'steps':
      return formatStepsNoUnit;
    case 'distance':
      return formatDistanceNoUnit;
    case 'lowIntensityTime':
      return timeConvertMinutes;
    case 'highIntensityTime':
      return timeConvertMinutes;
    case 'inactiveTime':
      return timeConvertMinutes;
    case 'moderateIntensityTime':
      return timeConvertMinutes;
    case 'averageActivityLevel':
      return formatIndividualTimesNoUnit;
    case 'calories':
      return formatIndividualTimesNoUnit;
    case 'maximumHeartRate':
      return formatHrNoUnit;
    case 'minimumHeartRate':
      return formatHrNoUnit;
    case 'restingHeartRate':
      return formatHrNoUnit;
    case 'averageHeartRate':
      return formatHrNoUnit;
    case 'averageHrv':
      return formatHrvNoUnit;
    case 'timeActive':
      return timeConvert;
    case 'timeResting':
      return timeConvert;
    case 'amountOfLowIntensityWork':
      return timeConvert;
    case 'amountOfVigorousIntensityWork':
      return timeConvert;
    case 'numberOfContinuousInactivePeriods':
      return formatIndividualTimesNoUnit;
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
      return formatPercentageNoUnit;
    case 'totalShortInterruptedTime':
      return timeConvert;
    case 'timeAwake':
      return timeConvert;
    case 'totalLongInterruptedTime':
      return timeConvert;
    case 'numberOfTimesAwareInTheNight':
      return formatIndividualTimesNoUnit;
    case 'timeInLightSleep':
      return timeConvert;
    case 'timeAsleep':
      return timeConvert;
    case 'numberOfREMEvents':
      return formatIndividualTimesNoUnit;
    case 'timeInDeepSleep':
      return timeConvert;
    case 'temperature':
      return formatIndividualTimesNoUnit;
    case 'readinessScore':
      return formatIndividualTimesNoUnit;
    case 'minimumBreathsPerMinute':
      return formatIndividualTimesNoUnit;
    case 'averageBreathsPerMinute':
      return formatIndividualTimesNoUnit;
    case 'maximumBreathsPerMinute':
      return formatIndividualTimesNoUnit;
    case 'numberOfSnoringEvents':
      return formatIndividualTimesNoUnit;
    case 'totalTimeSnoring':
      return timeConvert;
    case 'symptom':
      return symptomConvert;
    default:
      throw new Error(`Unknown key: ${key}`) as never;
  }
}
