import { Daily } from "terra-api";
import { DeviceResource, db } from "@pathize/db";

export async function updateOrCreateDailyRecord(
  item: Daily,
  userId: string,
  terraUserId: string,
  terraResource: DeviceResource,
  latestWebhookUpdate: Date | null,
  date: string
) {
  try {
    const existingRecord = await db.dailyData.findFirst({
      where: {
        userId: userId,
        date: date,
      },
    });

    // oxygen data
    const newSaturationSamples =
      existingRecord?.saturationSamples &&
      JSON.parse(existingRecord.saturationSamples as string)?.length >
        item.oxygen_data?.saturation_samples?.length
        ? null
        : item.oxygen_data?.saturation_samples;
    const newAvgSaturationPercentage =
      (existingRecord?.averageSaturationPercentage !== null ||
        existingRecord?.averageSaturationPercentage !== undefined) &&
      (item.oxygen_data?.avg_saturation_percentage === null ||
        item.oxygen_data?.avg_saturation_percentage === undefined)
        ? existingRecord?.averageSaturationPercentage
        : item.oxygen_data?.avg_saturation_percentage;
    const newVo2Samples =
      existingRecord?.vo2Samples &&
      JSON.parse(existingRecord.vo2Samples as string)?.length >
        item.oxygen_data?.vo2_samples?.length
        ? null
        : item.oxygen_data?.vo2_samples;
    const newVo2MaxMlPerMinPerKg =
      (existingRecord?.vo2MaxMlPerMinPerKg !== null ||
        existingRecord?.vo2MaxMlPerMinPerKg !== undefined) &&
      (item.oxygen_data?.vo2max_ml_per_min_per_kg === null ||
        item.oxygen_data?.vo2max_ml_per_min_per_kg === undefined)
        ? existingRecord?.vo2MaxMlPerMinPerKg
        : item.oxygen_data?.vo2max_ml_per_min_per_kg;
    // metadata
    const newUploadType = item.metadata?.upload_type;
    // tag data
    const newTagData = item.tag_data?.tags;
    // device data
    const newDeviceName = item.device_data?.name;
    const newOtherDevices = item.device_data?.other_devices;
    const newHardwareVersion = item.device_data?.hardware_version;
    const newManufacturer = item.device_data?.manufacturer;
    const newSoftwareVersion = item.device_data?.software_version;
    const newActivationTimestamp = item.device_data?.activation_timestamp;
    const newSerialNumber = item.device_data?.serial_number;
    // scores
    const newRecoveryScore =
      (existingRecord?.recoveryScore !== null ||
        existingRecord?.recoveryScore !== undefined) &&
      (item.scores?.recovery === null || item.scores?.recovery === undefined)
        ? existingRecord?.recoveryScore
        : item.scores?.recovery;
    const newActivityScore =
      (existingRecord?.activityScore !== null ||
        existingRecord?.activityScore !== undefined) &&
      (item.scores?.activity === null || item.scores?.activity === undefined)
        ? existingRecord?.activityScore
        : item.scores?.activity;
    const newSleepScore =
      (existingRecord?.sleepScore !== null ||
        existingRecord?.sleepScore !== undefined) &&
      (item.scores?.sleep === null || item.scores?.sleep === undefined)
        ? existingRecord?.sleepScore
        : item.scores?.sleep;
    // swimming
    const newSwimmingNumStrokes =
      existingRecord?.swimmingNumStrokes &&
      existingRecord?.swimmingNumStrokes >
        (item.distance_data?.swimming?.num_strokes ?? 0)
        ? null
        : item.distance_data?.swimming?.num_strokes;
    const newSwimmingNumLaps =
      existingRecord?.swimmingNumLaps &&
      existingRecord?.swimmingNumLaps >
        (item.distance_data?.swimming?.num_laps ?? 0)
        ? null
        : item.distance_data?.swimming?.num_laps;
    const newSwimmingPoolLengthMeters =
      existingRecord?.swimmingPoolLengthMeters &&
      existingRecord?.swimmingPoolLengthMeters >
        (item.distance_data?.swimming?.pool_length_meters ?? 0)
        ? null
        : item.distance_data?.swimming?.pool_length_meters;
    // elevation
    const newFloorsClimbed =
      existingRecord?.floorsClimbed &&
      existingRecord?.floorsClimbed > (item.distance_data?.floors_climbed ?? 0)
        ? null
        : item.distance_data?.floors_climbed;
    const newElevationLossActualMeters =
      existingRecord?.elevationLossActualMeters &&
      existingRecord?.elevationLossActualMeters >
        (item.distance_data?.elevation?.loss_actual_meters ?? 0)
        ? null
        : item.distance_data?.elevation?.loss_actual_meters;
    const newElevationMinMeters =
      existingRecord?.elevationMinMeters &&
      existingRecord?.elevationMinMeters >
        (item.distance_data?.elevation?.min_meters ?? 0)
        ? null
        : item.distance_data?.elevation?.min_meters;
    const newElevationAvgMeters =
      existingRecord?.elevationAvgMeters &&
      existingRecord?.elevationAvgMeters >
        (item.distance_data?.elevation?.avg_meters ?? 0)
        ? null
        : item.distance_data?.elevation?.avg_meters;
    const newElevationGainActualMeters =
      existingRecord?.elevationGainActualMeters &&
      existingRecord?.elevationGainActualMeters >
        (item.distance_data?.elevation?.gain_actual_meters ?? 0)
        ? null
        : item.distance_data?.elevation?.gain_actual_meters;
    const newElevationMaxMeters =
      existingRecord?.elevationMaxMeters &&
      existingRecord?.elevationMaxMeters >
        (item.distance_data?.elevation?.max_meters ?? 0)
        ? null
        : item.distance_data?.elevation?.max_meters;
    const newElevationGainPlannedMeters =
      existingRecord?.elevationGainPlannedMeters &&
      existingRecord?.elevationGainPlannedMeters >
        (item.distance_data?.elevation?.gain_planned_meters ?? 0)
        ? null
        : item.distance_data?.elevation?.gain_planned_meters;
    // steps
    const newSteps =
      existingRecord?.steps &&
      existingRecord?.steps > (item.distance_data?.steps ?? 0)
        ? null
        : item.distance_data?.steps;
    const newStepSamples =
      existingRecord?.stepSamples &&
      JSON.parse(existingRecord.stepSamples as string)?.length >
        item.distance_data?.detailed?.step_samples?.length
        ? null
        : item.distance_data?.detailed?.step_samples;
    const newDistanceSamples =
      existingRecord?.distanceSamples &&
      JSON.parse(existingRecord.distanceSamples as string)?.length >
        item.distance_data?.detailed?.distance_samples?.length
        ? null
        : item.distance_data?.detailed?.distance_samples;
    const newElevationSamples =
      existingRecord?.elevationSamples &&
      JSON.parse(existingRecord.elevationSamples as string)?.length >
        item.distance_data?.detailed?.elevation_samples?.length;
    const newDistance =
      existingRecord?.distance &&
      existingRecord?.distance > (item.distance_data?.distance_meters ?? 0)
        ? null
        : item.distance_data?.distance_meters;
    // MET (metabolic equivalent of task)
    const newMetSamples =
      existingRecord?.metSamples &&
      JSON.parse(existingRecord.metSamples as string)?.length >
        item.MET_data?.MET_samples?.length
        ? null
        : item.MET_data?.MET_samples;
    const newNumLowIntensityMinutes =
      (existingRecord?.numLowIntensityMinutes !== null ||
        existingRecord?.numLowIntensityMinutes !== undefined) &&
      (item.MET_data?.num_low_intensity_minutes === null ||
        item.MET_data?.num_low_intensity_minutes === undefined)
        ? existingRecord?.numLowIntensityMinutes
        : item.MET_data?.num_low_intensity_minutes;
    const newNumHighIntensityMinutes =
      (existingRecord?.numHighIntensityMinutes !== null ||
        existingRecord?.numHighIntensityMinutes !== undefined) &&
      (item.MET_data?.num_high_intensity_minutes === null ||
        item.MET_data?.num_high_intensity_minutes === undefined)
        ? existingRecord?.numHighIntensityMinutes
        : item.MET_data?.num_high_intensity_minutes;
    const newNumInactiveMinutes =
      (existingRecord?.numInactiveMinutes !== null ||
        existingRecord?.numInactiveMinutes !== undefined) &&
      (item.MET_data?.num_inactive_minutes === null ||
        item.MET_data?.num_inactive_minutes === undefined)
        ? existingRecord?.numInactiveMinutes
        : item.MET_data?.num_inactive_minutes;
    const newAvgLevel =
      (existingRecord?.avgLevel !== null ||
        existingRecord?.avgLevel !== undefined) &&
      (item.MET_data?.avg_level === null ||
        item.MET_data?.avg_level === undefined)
        ? existingRecord?.avgLevel
        : item.MET_data?.avg_level;
    // calories
    const newNetIntakeCalories =
      (existingRecord?.netIntakeCalories !== null ||
        existingRecord?.netIntakeCalories !== undefined) &&
      (item.calories_data?.net_intake_calories === null ||
        item.calories_data?.net_intake_calories === undefined)
        ? existingRecord?.netIntakeCalories
        : item.calories_data?.net_intake_calories;
    const newBmrCalories =
      (existingRecord?.bmrCalories !== null ||
        existingRecord?.bmrCalories !== undefined) &&
      (item.calories_data?.BMR_calories === null ||
        item.calories_data?.BMR_calories === undefined)
        ? existingRecord?.bmrCalories
        : item.calories_data?.BMR_calories;
    const newTotalCalories =
      (existingRecord?.totalCalories !== null ||
        existingRecord?.totalCalories !== undefined) &&
      (item.calories_data?.total_burned_calories === null ||
        item.calories_data?.total_burned_calories === undefined)
        ? existingRecord?.totalCalories
        : item.calories_data?.total_burned_calories;
    const newNetActivityCalories =
      (existingRecord?.netActivityCalories !== null ||
        existingRecord?.netActivityCalories !== undefined) &&
      (item.calories_data?.net_activity_calories === null ||
        item.calories_data?.net_activity_calories === undefined)
        ? existingRecord?.netActivityCalories
        : item.calories_data?.net_activity_calories;
    const newCalorieSamples =
      existingRecord?.calorieSamples &&
      JSON.parse(existingRecord.calorieSamples as string)?.length >
        item.calories_data?.calorie_samples?.length
        ? null
        : item.calories_data?.calorie_samples;
    // heart rate data
    const newMaxHrBpm =
      (existingRecord?.maxHrBpm !== null ||
        existingRecord?.maxHrBpm !== undefined) &&
      (item.heart_rate_data?.summary?.max_hr_bpm === null ||
        item.heart_rate_data?.summary?.max_hr_bpm === undefined)
        ? existingRecord?.maxHrBpm
        : item.heart_rate_data?.summary?.max_hr_bpm;
    const newRestingHrBpm =
      (existingRecord?.restingHrBpm !== null ||
        existingRecord?.restingHrBpm !== undefined) &&
      (item.heart_rate_data?.summary?.resting_hr_bpm === null ||
        item.heart_rate_data?.summary?.resting_hr_bpm === undefined)
        ? existingRecord?.restingHrBpm
        : item.heart_rate_data?.summary?.resting_hr_bpm;
    const newAvgHrvSDNN =
      (existingRecord?.avgHrvSDNN !== null ||
        existingRecord?.avgHrvSDNN !== undefined) &&
      (item.heart_rate_data?.summary?.avg_hrv_sdnn === null ||
        item.heart_rate_data?.summary?.avg_hrv_sdnn === undefined)
        ? existingRecord?.avgHrvSDNN
        : item.heart_rate_data?.summary?.avg_hrv_sdnn;
    const newMinHrBpm =
      (existingRecord?.minHrBpm !== null ||
        existingRecord?.minHrBpm !== undefined) &&
      (item.heart_rate_data?.summary?.min_hr_bpm === null ||
        item.heart_rate_data?.summary?.min_hr_bpm === undefined)
        ? existingRecord?.minHrBpm
        : item.heart_rate_data?.summary?.min_hr_bpm;
    const newUserMaxHrBpm =
      (existingRecord?.userMaxHrBpm !== null ||
        existingRecord?.userMaxHrBpm !== undefined) &&
      (item.heart_rate_data?.summary?.user_max_hr_bpm === null ||
        item.heart_rate_data?.summary?.user_max_hr_bpm === undefined)
        ? existingRecord?.userMaxHrBpm
        : item.heart_rate_data?.summary?.user_max_hr_bpm;
    const newAvgHrvRMSSD =
      (existingRecord?.avgHrvRMSSD !== null ||
        existingRecord?.avgHrvRMSSD !== undefined) &&
      (item.heart_rate_data?.summary?.avg_hrv_rmssd === null ||
        item.heart_rate_data?.summary?.avg_hrv_rmssd === undefined)
        ? existingRecord?.avgHrvRMSSD
        : item.heart_rate_data?.summary?.avg_hrv_rmssd;
    const newAvgHrBpm =
      (existingRecord?.avgHrBpm !== null ||
        existingRecord?.avgHrBpm !== undefined) &&
      (item.heart_rate_data?.summary?.avg_hr_bpm === null ||
        item.heart_rate_data?.summary?.avg_hr_bpm === undefined)
        ? existingRecord?.avgHrBpm
        : item.heart_rate_data?.summary?.avg_hr_bpm;
    const newHeartRateSamples =
      existingRecord?.heartRateSamples &&
      JSON.parse(existingRecord.heartRateSamples as string)?.length >
        item.heart_rate_data?.detailed?.hr_samples?.length
        ? null
        : item.heart_rate_data?.detailed?.hr_samples;
    const newHeartRateVarianceSamplesSDNN =
      existingRecord?.heartRateVarianceSamplesSDNN &&
      JSON.parse(existingRecord.heartRateVarianceSamplesSDNN as string)
        ?.length > item.heart_rate_data?.detailed?.hrv_samples_sdnn?.length
        ? null
        : item.heart_rate_data?.detailed?.hrv_samples_sdnn;
    const newHeartRateVarianceSamplesRMSSD =
      existingRecord?.heartRateVarianceSamplesRMSSD &&
      JSON.parse(existingRecord.heartRateVarianceSamplesRMSSD as string)
        .length > item.heart_rate_data?.detailed?.hrv_samples_rmssd?.length
        ? null
        : item.heart_rate_data?.detailed?.hrv_samples_rmssd;
    // active durations data
    const newActiveSeconds =
      (existingRecord?.activeSeconds !== null ||
        existingRecord?.activeSeconds !== undefined) &&
      (item.active_durations_data?.activity_seconds === null ||
        item.active_durations_data?.activity_seconds === undefined)
        ? existingRecord?.activeSeconds
        : item.active_durations_data?.activity_seconds;
    const newRestSeconds =
      (existingRecord?.restSeconds !== null ||
        existingRecord?.restSeconds !== undefined) &&
      (item.active_durations_data?.rest_seconds === null ||
        item.active_durations_data?.rest_seconds === undefined)
        ? existingRecord?.restSeconds
        : item.active_durations_data?.rest_seconds;
    const newLowIntensitySeconds =
      (existingRecord?.lowIntensitySeconds !== null ||
        existingRecord?.lowIntensitySeconds !== undefined) &&
      (item.active_durations_data?.low_intensity_seconds === null ||
        item.active_durations_data?.low_intensity_seconds === undefined)
        ? existingRecord?.lowIntensitySeconds
        : item.active_durations_data?.low_intensity_seconds;
    const newActivityLevelsSamples =
      existingRecord?.activityLevelsSamples &&
      JSON.parse(existingRecord.activityLevelsSamples as string)?.length >
        item.active_durations_data?.activity_levels_samples?.length
        ? null
        : item.active_durations_data?.activity_levels_samples;
    const newVigorousIntensitySeconds =
      (existingRecord?.vigorousIntensitySeconds !== null ||
        existingRecord?.vigorousIntensitySeconds !== undefined) &&
      (item.active_durations_data?.vigorous_intensity_seconds === null ||
        item.active_durations_data?.vigorous_intensity_seconds === undefined)
        ? existingRecord?.vigorousIntensitySeconds
        : item.active_durations_data?.vigorous_intensity_seconds;
    const newNumContinuousInactivePeriods =
      (existingRecord?.numContinuousInactivePeriods !== null ||
        existingRecord?.numContinuousInactivePeriods !== undefined) &&
      (item.active_durations_data?.num_continuous_inactive_periods === null ||
        item.active_durations_data?.num_continuous_inactive_periods ===
          undefined)
        ? existingRecord?.numContinuousInactivePeriods
        : item.active_durations_data?.num_continuous_inactive_periods;
    const newInactivitySeconds =
      (existingRecord?.inactivitySeconds !== null ||
        existingRecord?.inactivitySeconds !== undefined) &&
      (item.active_durations_data?.inactivity_seconds === null ||
        item.active_durations_data?.inactivity_seconds === undefined)
        ? existingRecord?.inactivitySeconds
        : item.active_durations_data?.inactivity_seconds;
    const newModerateIntensitySeconds =
      (existingRecord?.moderateIntensitySeconds !== null ||
        existingRecord?.moderateIntensitySeconds !== undefined) &&
      (item.active_durations_data?.moderate_intensity_seconds === null ||
        item.active_durations_data?.moderate_intensity_seconds === undefined)
        ? existingRecord?.moderateIntensitySeconds
        : item.active_durations_data?.moderate_intensity_seconds;
    const newStandingSeconds =
      (existingRecord?.standingSeconds !== null ||
        existingRecord?.standingSeconds !== undefined) &&
      (item.active_durations_data?.standing_seconds === null ||
        item.active_durations_data?.standing_seconds === undefined)
        ? existingRecord?.standingSeconds
        : item.active_durations_data?.standing_seconds;
    // stress data
    const newRestStressDurationSeconds =
      (existingRecord?.restStressDurationSeconds !== null ||
        existingRecord?.restStressDurationSeconds !== undefined) &&
      (item.stress_data?.rest_stress_duration_seconds === null ||
        item.stress_data?.rest_stress_duration_seconds === undefined)
        ? existingRecord?.restStressDurationSeconds
        : item.stress_data?.rest_stress_duration_seconds;
    const newStressDurationSeconds =
      (existingRecord?.stressDurationSeconds !== null ||
        existingRecord?.stressDurationSeconds !== undefined) &&
      (item.stress_data?.stress_duration_seconds === null ||
        item.stress_data?.stress_duration_seconds === undefined)
        ? existingRecord?.stressDurationSeconds
        : item.stress_data?.stress_duration_seconds;
    const newActivityStressDurationSeconds =
      (existingRecord?.activityStressDurationSeconds !== null ||
        existingRecord?.activityStressDurationSeconds !== undefined) &&
      (item.stress_data?.activity_stress_duration_seconds === null ||
        item.stress_data?.activity_stress_duration_seconds === undefined)
        ? existingRecord?.activityStressDurationSeconds
        : item.stress_data?.activity_stress_duration_seconds;
    const newAvgStressLevel =
      (existingRecord?.avgStressLevel !== null ||
        existingRecord?.avgStressLevel !== undefined) &&
      (item.stress_data?.avg_stress_level === null ||
        item.stress_data?.avg_stress_level === undefined)
        ? existingRecord?.avgStressLevel
        : item.stress_data?.avg_stress_level;
    const newMediumStressDurationSeconds =
      (existingRecord?.mediumStressDurationSeconds !== null ||
        existingRecord?.mediumStressDurationSeconds !== undefined) &&
      (item.stress_data?.medium_stress_duration_seconds === null ||
        item.stress_data?.medium_stress_duration_seconds === undefined)
        ? existingRecord?.mediumStressDurationSeconds
        : item.stress_data?.medium_stress_duration_seconds;
    const newStressDataSamples =
      existingRecord?.stressDataSamples &&
      JSON.parse(existingRecord.stressDataSamples as string).length >
        item.stress_data?.samples?.length
        ? null
        : item.stress_data?.samples;
    const newHighStressDurationSeconds =
      (existingRecord?.highStressDurationSeconds !== null ||
        existingRecord?.highStressDurationSeconds !== undefined) &&
      (item.stress_data?.high_stress_duration_seconds === null ||
        item.stress_data?.high_stress_duration_seconds === undefined)
        ? existingRecord?.highStressDurationSeconds
        : item.stress_data?.high_stress_duration_seconds;
    const newMaxStressLevel =
      (existingRecord?.maxStressLevel !== null ||
        existingRecord?.maxStressLevel !== undefined) &&
      (item.stress_data?.max_stress_level === null ||
        item.stress_data?.max_stress_level === undefined)
        ? existingRecord?.maxStressLevel
        : item.stress_data?.max_stress_level;

    const dataToUpdate = {
      date: date,
      terraUserId: terraUserId,
      // oxygen data
      saturationSamples: JSON.stringify(newSaturationSamples),
      averageSaturationPercentage: newAvgSaturationPercentage,
      vo2Samples: JSON.stringify(newVo2Samples),
      vo2MaxMlPerMinPerKg: newVo2MaxMlPerMinPerKg,
      // metadata
      uploadType: newUploadType,
      // tag data
      tagData: JSON.stringify(newTagData),
      // device data
      deviceName: newDeviceName,
      otherDevices: JSON.stringify(newOtherDevices),
      hardwareVersion: newHardwareVersion,
      manufacturer: newManufacturer,
      softwareVersion: newSoftwareVersion,
      activationTimestamp: newActivationTimestamp,
      serialNumber: newSerialNumber,
      // scores
      recoveryScore: newRecoveryScore,
      activityScore: newActivityScore,
      sleepScore: newSleepScore,
      // swimming
      swimmingNumStrokes: newSwimmingNumStrokes,
      swimmingNumLaps: newSwimmingNumLaps,
      swimmingPoolLengthMeters: newSwimmingPoolLengthMeters,
      // elevation
      floorsClimbed: newFloorsClimbed,
      elevationLossActualMeters: newElevationLossActualMeters,
      elevationMinMeters: newElevationMinMeters,
      elevationAvgMeters: newElevationAvgMeters,
      elevationGainActualMeters: newElevationGainActualMeters,
      elevationMaxMeters: newElevationMaxMeters,
      elevationGainPlannedMeters: newElevationGainPlannedMeters,
      // steps
      steps: newSteps,
      stepSamples: JSON.stringify(newStepSamples),
      distanceSamples: JSON.stringify(newDistanceSamples),
      elevationSamples: JSON.stringify(newElevationSamples),
      distance: newDistance,
      // MET (metabolic equivalent of task)
      metSamples: JSON.stringify(newMetSamples),
      numLowIntensityMinutes: newNumLowIntensityMinutes,
      numHighIntensityMinutes: newNumHighIntensityMinutes,
      numInactiveMinutes: newNumInactiveMinutes,
      avgLevel: newAvgLevel,
      // calories
      netIntakeCalories: newNetIntakeCalories,
      bmrCalories: newBmrCalories,
      totalCalories: newTotalCalories,
      netActivityCalories: newNetActivityCalories,
      calorieSamples: JSON.stringify(newCalorieSamples),
      // heart rate data
      maxHrBpm: newMaxHrBpm,
      restingHrBpm: newRestingHrBpm,
      avgHrvSDNN: newAvgHrvSDNN,
      minHrBpm: newMinHrBpm,
      userMaxHrBpm: newUserMaxHrBpm,
      avgHrvRMSSD: newAvgHrvRMSSD,
      avgHrBpm: newAvgHrBpm,
      heartRateSamples: JSON.stringify(newHeartRateSamples),
      heartRateVarianceSamplesSDNN: JSON.stringify(
        newHeartRateVarianceSamplesSDNN
      ),
      heartRateVarianceSamplesRMSSD: JSON.stringify(
        newHeartRateVarianceSamplesRMSSD
      ),
      // active durations data
      activeSeconds: newActiveSeconds,
      restSeconds: newRestSeconds,
      lowIntensitySeconds: newLowIntensitySeconds,
      activityLevelsSamples: JSON.stringify(newActivityLevelsSamples),
      vigorousIntensitySeconds: newVigorousIntensitySeconds,
      numContinuousInactivePeriods: newNumContinuousInactivePeriods,
      inactivitySeconds: newInactivitySeconds,
      moderateIntensitySeconds: newModerateIntensitySeconds,
      standingSeconds: newStandingSeconds,
      // stress data
      restStressDurationSeconds: newRestStressDurationSeconds,
      stressDurationSeconds: newStressDurationSeconds,
      activityStressDurationSeconds: newActivityStressDurationSeconds,
      avgStressLevel: newAvgStressLevel,
      mediumStressDurationSeconds: newMediumStressDurationSeconds,
      stressDataSamples: JSON.stringify(newStressDataSamples),
      highStressDurationSeconds: newHighStressDurationSeconds,
      maxStressLevel: newMaxStressLevel,
      // everything else
      userId: userId,
      resource: terraResource,
      latestWebhookUpdate: latestWebhookUpdate,
    };

    if (!existingRecord) {
      console.log(`creating new daily record for date ${date}`);
      return await db.dailyData.create({
        data: { ...dataToUpdate, createdAt: new Date() },
      });
    }

    console.log(`updating existing daily record for date ${date}`);
    await db.dailyData.update({
      where: {
        id: existingRecord.id,
      },
      data: { ...dataToUpdate, updatedAt: new Date() },
    });
  } catch (e) {
    console.log(e);
  }
}
