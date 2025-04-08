export type TrendsResponse = {
  date: string;
  //////////////////////////
  // LIMIT DATA
  //////////////////////////
  //////////////////////////
  // DAILY DATA
  //////////////////////////
  minutesAboveLimit: number;
  // oxygen data
  averageSaturationPercentage: number | null;
  vo2MaxMlPerMinPerKg: number | null;
  // scores
  recoveryScore: number | null;
  activityScore: number | null;
  sleepScore: number | null;
  // swimming
  swimmingNumStrokes: number | null;
  swimmingNumLaps: number | null;
  swimmingPoolLengthMeters: number | null;
  // elevation
  floorsClimbed: number | null;
  elevationLossActualMeters: number | null;
  elevationMinMeters: number | null;
  elevationAvgMeters: number | null;
  elevationGainActualMeters: number | null;
  elevationMaxMeters: number | null;
  elevationGainPlannedMeters: number | null;
  // steps
  steps: number | null;
  distance: number | null;
  // MET
  numLowIntensityMinutes: number | null;
  munHighIntensityMinutes: number | null;
  numInactiveMinutes: number | null;
  numModerateIntensityMinutes: number | null;
  avgLevel: number | null;
  // calories
  totalCalories: number | null;
  // heart rate
  maxHrBpm: number | null;
  minHrBpm: number | null;
  restingHrBpm: number | null;
  avgHrBpm: number | null;
  avgHrv: number | null;
  // active durations data
  activeSeconds: number | null;
  restSeconds: number | null;
  lowIntensitySeconds: number | null;
  vigorousIntensitySeconds: number | null;
  numContinuousInactivePeriods: number | null;
  inactivitySeconds: number | null;
  moderateIntensitySeconds: number | null;
  //////////////////////////
  // SLEEP DATA
  //////////////////////////
  // sleep duration data
  durationInBedSeconds: number | null;
  durationUnmeasurableSleepSeconds: number | null;
  sleepEfficiency: number | null;
  durationShortInterruptionSeconds: number | null;
  durationAwakeStateSeconds: number | null;
  durationLongInterruptionSeconds: number | null;
  numWakeupEvents: number | null;
  durationLightSleepStateSeconds: number | null;
  durationAsleepStateSeconds: number | null;
  numRemEvents: number | null;
  durationDeepSleepStateSeconds: number | null;
  // temperature delta
  temperatureDelta: number | null;
  // readiness
  readinessScore: number | null;
  recoveryLevel: number | null;
  // respiration data
  minBreathsPerMin: number | null;
  avgBreathsPerMin: number | null;
  maxBreathsPerMin: number | null;
  // snoring events
  numSnoringEvents: number | null;
  totalSnoringDurationSeconds: number | null;
};
