import { HeartRateDataSample } from "terra-api/lib/cjs/models/samples/HeartRateDataSample";

export function getTimeAboveLimit(
  heartRateData: HeartRateDataSample[],
  limit: number
) {
  return heartRateData.reduce((acc, currentSample, i, arr) => {
    if (i === arr.length - 1) return acc; // Skip the last element

    const nextSample = arr[i + 1];
    const currentTime = new Date(currentSample.timestamp).getTime();
    const nextTime = new Date(nextSample.timestamp).getTime();
    const timeDiff = (nextTime - currentTime) / 1000; // time difference in seconds

    if (timeDiff > 300) return acc; // skip if timeDiff is greater than five minutes

    if (
      (currentSample.bpm < limit && nextSample.bpm > limit) ||
      (currentSample.bpm > limit && nextSample.bpm < limit)
    ) {
      const ratio = Math.abs(
        (limit - currentSample.bpm) / (nextSample.bpm - currentSample.bpm)
      );
      const crossingTime = timeDiff * ratio;

      return currentSample.bpm < limit
        ? acc + timeDiff - crossingTime
        : acc + crossingTime;
    } else if (currentSample.bpm >= limit && nextSample.bpm >= limit) {
      return acc + timeDiff; // add entire segment if they are both at or above limit
    }

    return acc;
  }, 0);
}
