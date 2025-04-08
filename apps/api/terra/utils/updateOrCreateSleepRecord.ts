import { Sleep } from "terra-api";
import { DeviceResource, db } from "@pathize/db";

export async function updateOrCreateSleepRecord(
  item: Sleep,
  userId: string,
  terraUserId: string,
  terraResource: DeviceResource,
  latestWebhookUpdate: Date | null,
  date: string
) {
  try {
    const existingRecord = await db.sleepData.findFirst({
      where: {
        userId: userId,
        date: date,
      },
    });

    const newDurationInBedSeconds =
      existingRecord?.durationInBedSeconds !== null &&
      existingRecord?.durationInBedSeconds !== undefined &&
      (item.sleep_durations_data?.other?.duration_in_bed_seconds === null ||
        item.sleep_durations_data?.other?.duration_in_bed_seconds === undefined)
        ? existingRecord?.durationInBedSeconds
        : item.sleep_durations_data?.other?.duration_in_bed_seconds;
    const newDurationUnmeasurableSleepSeconds =
      existingRecord?.durationUnmeasurableSleepSeconds !== null &&
      existingRecord?.durationUnmeasurableSleepSeconds !== undefined &&
      (item.sleep_durations_data?.other?.duration_unmeasurable_sleep_seconds ===
        null ||
        item.sleep_durations_data?.other
          ?.duration_unmeasurable_sleep_seconds === undefined)
        ? existingRecord?.durationUnmeasurableSleepSeconds
        : item.sleep_durations_data?.other?.duration_unmeasurable_sleep_seconds;
    const newSleepEfficiency =
      existingRecord?.sleepEfficiency !== null &&
      existingRecord?.sleepEfficiency !== undefined &&
      (item.sleep_durations_data?.sleep_efficiency === null ||
        item.sleep_durations_data?.sleep_efficiency === undefined)
        ? existingRecord?.sleepEfficiency
        : item.sleep_durations_data?.sleep_efficiency;
    const newHypnogramSamples =
      existingRecord?.hypnogramSamples &&
      JSON.parse(existingRecord?.hypnogramSamples as string)?.length >
        item.sleep_durations_data?.hypnogram_samples?.length
        ? existingRecord?.hypnogramSamples
        : item.sleep_durations_data?.hypnogram_samples;
    const newDurationShortInterruptionSeconds =
      existingRecord?.durationShortInterruptionSeconds !== null &&
      existingRecord?.durationShortInterruptionSeconds !== undefined &&
      (item.sleep_durations_data?.awake?.duration_short_interruption_seconds ===
        null ||
        item.sleep_durations_data?.awake
          ?.duration_short_interruption_seconds === undefined)
        ? existingRecord?.durationShortInterruptionSeconds
        : item.sleep_durations_data?.awake?.duration_short_interruption_seconds;
    const newDurationAwakeStateSeconds =
      existingRecord?.durationAwakeStateSeconds !== null &&
      existingRecord?.durationAwakeStateSeconds !== undefined &&
      (item.sleep_durations_data?.awake?.duration_awake_state_seconds ===
        null ||
        item.sleep_durations_data?.awake?.duration_awake_state_seconds ===
          undefined)
        ? existingRecord?.durationAwakeStateSeconds
        : item.sleep_durations_data?.awake?.duration_awake_state_seconds;
    const newDurationLongInterruptionSeconds =
      existingRecord?.durationLongInterruptionSeconds !== null &&
      existingRecord?.durationLongInterruptionSeconds !== undefined &&
      (item.sleep_durations_data?.awake?.duration_long_interruption_seconds ===
        null ||
        item.sleep_durations_data?.awake?.duration_long_interruption_seconds ===
          undefined)
        ? existingRecord?.durationLongInterruptionSeconds
        : item.sleep_durations_data?.awake?.duration_long_interruption_seconds;
    const newNumWakeupEvents =
      existingRecord?.numWakeupEvents !== null &&
      existingRecord?.numWakeupEvents !== undefined &&
      (item.sleep_durations_data?.awake?.num_wakeup_events === null ||
        item.sleep_durations_data?.awake?.num_wakeup_events === undefined)
        ? existingRecord?.numWakeupEvents
        : item.sleep_durations_data?.awake?.num_wakeup_events;
    const newWakeUpLatencySeconds =
      existingRecord?.wakeUpLatencySeconds !== null &&
      existingRecord?.wakeUpLatencySeconds !== undefined &&
      (item.sleep_durations_data?.awake?.wake_up_latency_seconds === null ||
        item.sleep_durations_data?.awake?.wake_up_latency_seconds === undefined)
        ? existingRecord?.wakeUpLatencySeconds
        : item.sleep_durations_data?.awake?.wake_up_latency_seconds;
    const newNumOutOfBedEvents =
      existingRecord?.numOutOfBedEvents !== null &&
      existingRecord?.numOutOfBedEvents !== undefined &&
      (item.sleep_durations_data?.awake?.num_out_of_bed_events === null ||
        item.sleep_durations_data?.awake?.num_out_of_bed_events === undefined)
        ? existingRecord?.numOutOfBedEvents
        : item.sleep_durations_data?.awake?.num_out_of_bed_events;
    const newSleepLatencySeconds =
      existingRecord?.sleepLatencySeconds !== null &&
      existingRecord?.sleepLatencySeconds !== undefined &&
      (item.sleep_durations_data?.awake?.sleep_latency_seconds === null ||
        item.sleep_durations_data?.awake?.sleep_latency_seconds === undefined)
        ? existingRecord?.sleepLatencySeconds
        : item.sleep_durations_data?.awake?.sleep_latency_seconds;
    const newDurationLightSleepStateSeconds =
      existingRecord?.durationLightSleepStateSeconds !== null &&
      existingRecord?.durationLightSleepStateSeconds !== undefined &&
      (item.sleep_durations_data?.asleep?.duration_light_sleep_state_seconds ===
        null ||
        item.sleep_durations_data?.asleep
          ?.duration_light_sleep_state_seconds === undefined)
        ? existingRecord?.durationLightSleepStateSeconds
        : item.sleep_durations_data?.asleep?.duration_light_sleep_state_seconds;
    const newDurationAsleepStateSeconds =
      existingRecord?.durationAsleepStateSeconds !== null &&
      existingRecord?.durationAsleepStateSeconds !== undefined &&
      (item.sleep_durations_data?.asleep?.duration_asleep_state_seconds ===
        null ||
        item.sleep_durations_data?.asleep?.duration_asleep_state_seconds ===
          undefined)
        ? existingRecord?.durationAsleepStateSeconds
        : item.sleep_durations_data?.asleep?.duration_asleep_state_seconds;
    const newNumRemEvents =
      existingRecord?.numRemEvents !== null &&
      existingRecord?.numRemEvents !== undefined &&
      (item.sleep_durations_data?.asleep?.num_REM_events === null ||
        item.sleep_durations_data?.asleep?.num_REM_events === undefined)
        ? existingRecord?.numRemEvents
        : item.sleep_durations_data?.asleep?.num_REM_events;
    const newDurationDeepSleepStateSeconds =
      existingRecord?.durationDeepSleepStateSeconds !== null &&
      existingRecord?.durationDeepSleepStateSeconds !== undefined &&
      (item.sleep_durations_data?.asleep?.duration_deep_sleep_state_seconds ===
        null ||
        item.sleep_durations_data?.asleep?.duration_deep_sleep_state_seconds ===
          undefined)
        ? existingRecord?.durationDeepSleepStateSeconds
        : item.sleep_durations_data?.asleep?.duration_deep_sleep_state_seconds;
    const newDeviceName = item.device_data?.name;
    const newOtherDevices = item.device_data?.other_devices;
    const newHardwareVersion = item.device_data?.hardware_version;
    const newManufacturer = item.device_data?.manufacturer;
    const newSoftwareVersion = item.device_data?.software_version;
    const newActivationTimestamp = item.device_data?.activation_timestamp;
    const newSerialNumber = item.device_data?.serial_number;
    const newUploadType = item.metadata?.upload_type;
    // heart
    const newMaxHrBpm =
      existingRecord?.maxHrBpm !== null &&
      existingRecord?.maxHrBpm !== undefined &&
      (item.heart_rate_data?.summary?.max_hr_bpm === null ||
        item.heart_rate_data?.summary?.max_hr_bpm === undefined)
        ? existingRecord?.maxHrBpm
        : item.heart_rate_data?.summary?.max_hr_bpm;
    const newAvgHrvRMSSD =
      existingRecord?.avgHrvRMSSD !== null &&
      existingRecord?.avgHrvRMSSD !== undefined &&
      (item.heart_rate_data?.summary?.avg_hrv_rmssd === null ||
        item.heart_rate_data?.summary?.avg_hrv_rmssd === undefined)
        ? existingRecord?.avgHrvRMSSD
        : item.heart_rate_data?.summary?.avg_hrv_rmssd;
    const newMinHrBpm =
      existingRecord?.minHrBpm !== null &&
      existingRecord?.minHrBpm !== undefined &&
      (item.heart_rate_data?.summary?.min_hr_bpm === null ||
        item.heart_rate_data?.summary?.min_hr_bpm === undefined)
        ? existingRecord?.minHrBpm
        : item.heart_rate_data?.summary?.min_hr_bpm;
    const newUserMaxHrBpm =
      existingRecord?.userMaxHrBpm !== null &&
      existingRecord?.userMaxHrBpm !== undefined &&
      (item.heart_rate_data?.summary?.user_max_hr_bpm === null ||
        item.heart_rate_data?.summary?.user_max_hr_bpm === undefined)
        ? existingRecord?.userMaxHrBpm
        : item.heart_rate_data?.summary?.user_max_hr_bpm;
    const newAvgHrBpm =
      existingRecord?.avgHrBpm !== null &&
      existingRecord?.avgHrBpm !== undefined &&
      (item.heart_rate_data?.summary?.avg_hr_bpm === null ||
        item.heart_rate_data?.summary?.avg_hr_bpm === undefined)
        ? existingRecord?.avgHrBpm
        : item.heart_rate_data?.summary?.avg_hr_bpm;
    const newAvgHrvSDNN =
      existingRecord?.avgHrvSDNN !== null &&
      existingRecord?.avgHrvSDNN !== undefined &&
      (item.heart_rate_data?.summary?.avg_hrv_sdnn === null ||
        item.heart_rate_data?.summary?.avg_hrv_sdnn === undefined)
        ? existingRecord?.avgHrvSDNN
        : item.heart_rate_data?.summary?.avg_hrv_sdnn;
    const newRestingHrBpm =
      existingRecord?.restingHrBpm !== null &&
      existingRecord?.restingHrBpm !== undefined &&
      (item.heart_rate_data?.summary?.resting_hr_bpm === null ||
        item.heart_rate_data?.summary?.resting_hr_bpm === undefined)
        ? existingRecord?.restingHrBpm
        : item.heart_rate_data?.summary?.resting_hr_bpm;
    const newHeartRateSamples =
      existingRecord?.heartRateSamples &&
      JSON.parse(existingRecord?.heartRateSamples as string)?.length >
        item.heart_rate_data?.detailed?.hr_samples?.length
        ? existingRecord?.heartRateSamples
        : item.heart_rate_data?.detailed?.hr_samples;
    const newHeartRateVarianceSamplesSDNN =
      existingRecord?.heartRateVarianceSamplesSDNN &&
      JSON.parse(existingRecord?.heartRateVarianceSamplesSDNN as string)
        .length > item.heart_rate_data?.detailed?.hrv_samples_sdnn?.length
        ? existingRecord?.heartRateVarianceSamplesSDNN
        : item.heart_rate_data?.detailed?.hrv_samples_sdnn;
    const newHeartRateVarianceSamplesRMSSD =
      existingRecord?.heartRateVarianceSamplesRMSSD &&
      JSON.parse(existingRecord?.heartRateVarianceSamplesRMSSD as string)
        .length > item.heart_rate_data?.detailed?.hrv_samples_rmssd?.length
        ? existingRecord?.heartRateVarianceSamplesRMSSD
        : item.heart_rate_data?.detailed?.hrv_samples_rmssd;
    // temperature delta
    const newTemperatureDelta =
      existingRecord?.temperatureDelta !== null &&
      existingRecord?.temperatureDelta !== undefined &&
      (item.temperature_data?.delta === null ||
        item.temperature_data?.delta === undefined)
        ? existingRecord?.temperatureDelta
        : item.temperature_data?.delta;
    // readiness
    const newReadinessScore =
      existingRecord?.readinessScore !== null &&
      existingRecord?.readinessScore !== undefined &&
      (item.readiness_data?.readiness === null ||
        item.readiness_data?.readiness === undefined)
        ? existingRecord?.readinessScore
        : item.readiness_data?.readiness;
    const newRecoveryLevel =
      existingRecord?.recoveryLevel !== null &&
      existingRecord?.recoveryLevel !== undefined &&
      (item.readiness_data?.recovery_level === null ||
        item.readiness_data?.recovery_level === undefined)
        ? existingRecord?.recoveryLevel
        : item.readiness_data?.recovery_level;
    const newMinBreathsPerMin =
      existingRecord?.minBreathsPerMin !== null &&
      existingRecord?.minBreathsPerMin !== undefined &&
      (item.respiration_data?.breaths_data?.min_breaths_per_min === null ||
        item.respiration_data?.breaths_data?.min_breaths_per_min === undefined)
        ? existingRecord?.minBreathsPerMin
        : item.respiration_data?.breaths_data?.min_breaths_per_min;
    const newAvgBreathsPerMin =
      existingRecord?.avgBreathsPerMin !== null &&
      existingRecord?.avgBreathsPerMin !== undefined &&
      (item.respiration_data?.breaths_data?.avg_breaths_per_min === null ||
        item.respiration_data?.breaths_data?.avg_breaths_per_min === undefined)
        ? existingRecord?.avgBreathsPerMin
        : item.respiration_data?.breaths_data?.avg_breaths_per_min;
    const newMaxBreathsPerMin =
      existingRecord?.maxBreathsPerMin !== null &&
      existingRecord?.maxBreathsPerMin !== undefined &&
      (item.respiration_data?.breaths_data?.max_breaths_per_min === null ||
        item.respiration_data?.breaths_data?.max_breaths_per_min === undefined)
        ? existingRecord?.maxBreathsPerMin
        : item.respiration_data?.breaths_data?.max_breaths_per_min;
    const newOnDemandReading =
      existingRecord?.onDemandReading !== null &&
      existingRecord?.onDemandReading !== undefined &&
      (item.respiration_data?.breaths_data?.on_demand_reading === null ||
        item.respiration_data?.breaths_data?.on_demand_reading === undefined)
        ? existingRecord?.onDemandReading
        : item.respiration_data?.breaths_data?.on_demand_reading;
    const newRespirationDataEndTime =
      item.respiration_data?.breaths_data?.end_time;
    const newRespirationDataSamples =
      existingRecord?.respirationDataSamples &&
      JSON.parse(existingRecord?.respirationDataSamples as string)?.length >
        item.respiration_data?.breaths_data?.samples?.length
        ? existingRecord?.respirationDataSamples
        : item.respiration_data?.breaths_data?.samples;
    const newRespirationDataStartTime =
      item.respiration_data?.breaths_data?.start_time;
    const newNumSnoringEvents =
      existingRecord?.numSnoringEvents !== null &&
      existingRecord?.numSnoringEvents !== undefined &&
      (item.respiration_data?.snoring_data?.num_snoring_events === null ||
        item.respiration_data?.snoring_data?.num_snoring_events === undefined)
        ? existingRecord?.numSnoringEvents
        : item.respiration_data?.snoring_data?.num_snoring_events;
    const newTotalSnoringDurationSeconds =
      existingRecord?.totalSnoringDurationSeconds !== null &&
      existingRecord?.totalSnoringDurationSeconds !== undefined &&
      (item.respiration_data?.snoring_data?.total_snoring_duration_seconds ===
        null ||
        item.respiration_data?.snoring_data?.total_snoring_duration_seconds ===
          undefined)
        ? existingRecord?.totalSnoringDurationSeconds
        : item.respiration_data?.snoring_data?.total_snoring_duration_seconds;
    const newSnoringDataEndTime = item.respiration_data?.snoring_data?.end_time;
    const newSnoringDataSamples =
      existingRecord?.snoringDataSamples &&
      JSON.parse(existingRecord?.snoringDataSamples as string)?.length >
        item.respiration_data?.snoring_data?.samples?.length
        ? existingRecord?.snoringDataSamples
        : item.respiration_data?.snoring_data?.samples;
    const newSnoringDataStartTime =
      item.respiration_data?.snoring_data?.start_time;
    const newOxygenSaturationDataStartTime =
      item.respiration_data?.oxygen_saturation_data?.start_time;
    const newOxygenSaturationDataEndTime =
      item.respiration_data?.oxygen_saturation_data?.end_time;
    const newOxygenSaturationDataSamples =
      existingRecord?.oxygenSaturationDataSamples &&
      JSON.parse(existingRecord?.oxygenSaturationDataSamples as string)
        ?.length >
        item.respiration_data?.oxygen_saturation_data?.samples?.length
        ? existingRecord?.oxygenSaturationDataSamples
        : item.respiration_data?.oxygen_saturation_data?.samples;

    const dataToUpdate = {
      date: date,
      terraUserId: terraUserId,
      // sleep durations data
      durationInBedSeconds: newDurationInBedSeconds,
      durationUnmeasurableSleepSeconds: newDurationUnmeasurableSleepSeconds,
      sleepEfficiency: newSleepEfficiency,
      hypnogramSamples: JSON.stringify(newHypnogramSamples),
      durationShortInterruptionSeconds: newDurationShortInterruptionSeconds,
      durationAwakeStateSeconds: newDurationAwakeStateSeconds,
      durationLongInterruptionSeconds: newDurationLongInterruptionSeconds,
      numWakeupEvents: newNumWakeupEvents,
      wakeUpLatencySeconds: newWakeUpLatencySeconds,
      numOutOfBedEvents: newNumOutOfBedEvents,
      sleepLatencySeconds: newSleepLatencySeconds,
      durationLightSleepStateSeconds: newDurationLightSleepStateSeconds,
      durationAsleepStateSeconds: newDurationAsleepStateSeconds,
      numRemEvents: newNumRemEvents,
      durationDeepSleepStateSeconds: newDurationDeepSleepStateSeconds,
      // device data
      deviceName: newDeviceName,
      otherDevices: JSON.stringify(newOtherDevices),
      hardwareVersion: newHardwareVersion,
      manufacturer: newManufacturer,
      softwareVersion: newSoftwareVersion,
      activationTimestamp: newActivationTimestamp,
      serialNumber: newSerialNumber,
      // metadata:
      uploadType: newUploadType,
      // heart rate data
      maxHrBpm: newMaxHrBpm,
      avgHrvRMSSD: newAvgHrvRMSSD,
      minHrBpm: newMinHrBpm,
      userMaxHrBpm: newUserMaxHrBpm,
      avgHrBpm: newAvgHrBpm,
      avgHrvSDNN: newAvgHrvSDNN,
      restingHrBpm: newRestingHrBpm,
      // detailed
      heartRateSamples: JSON.stringify(newHeartRateSamples),
      heartRateVarianceSamplesSDNN: JSON.stringify(
        newHeartRateVarianceSamplesSDNN
      ),
      heartRateVarianceSamplesRMSSD: JSON.stringify(
        newHeartRateVarianceSamplesRMSSD
      ),
      // temperature delta
      temperatureDelta: newTemperatureDelta,
      // readiness
      readinessScore: newReadinessScore,
      recoveryLevel: newRecoveryLevel,
      // respiration data
      minBreathsPerMin: newMinBreathsPerMin,
      avgBreathsPerMin: newAvgBreathsPerMin,
      maxBreathsPerMin: newMaxBreathsPerMin,
      onDemandReading: newOnDemandReading,
      respirationDataEndTime: newRespirationDataEndTime,
      respirationDataSamples: JSON.stringify(newRespirationDataSamples),
      respirationDataStartTime: newRespirationDataStartTime,
      // snoring data
      numSnoringEvents: newNumSnoringEvents,
      totalSnoringDurationSeconds: newTotalSnoringDurationSeconds,
      snoringDataEndTime: newSnoringDataEndTime,
      snoringDataSamples: JSON.stringify(newSnoringDataSamples),
      snoringDataStartTime: newSnoringDataStartTime,
      // o2 data
      oxygenSaturationDataStartTime: newOxygenSaturationDataStartTime,
      oxygenSaturationDataEndTime: newOxygenSaturationDataEndTime,
      oxygenSaturationDataSamples: JSON.stringify(
        newOxygenSaturationDataSamples
      ),

      // everything else
      userId: userId,
      resource: terraResource,
      latestWebhookUpdate: latestWebhookUpdate,
    };

    if (!existingRecord) {
      console.log(`creating new sleep record for date ${date}`);
      return await db.sleepData.create({
        data: {
          ...dataToUpdate,
          createdAt: new Date(),
        },
      });
    }

    console.log(`updating existing sleep record for date ${date}`);
    await db.sleepData.update({
      where: {
        id: existingRecord.id,
      },
      data: {
        ...dataToUpdate,
        updatedAt: new Date(),
      },
    });
  } catch (err) {
    console.error(err);
  }
}
