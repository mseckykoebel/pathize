import { HeartRateDataSample } from "terra-api/lib/cjs/models/samples/HeartRateDataSample";
import dayjs from "dayjs";

function removeTimestamps(
  points: HeartRateDataSample[]
): HeartRateDataSample[] {
  const secondsInDay = 86400;
  const timeMap: { [key: number]: boolean } = {};
  const processedHeartRateData: HeartRateDataSample[] = [];

  for (let i = 0; i < points.length; i++) {
    const sample = points[i];
    const time = dayjs(sample.timestamp);
    const seconds = time.hour() * 3600 + time.minute() * 60 + time.second();

    if (timeMap[seconds]) {
      continue;
    }

    let skip = false;
    for (let j = 1; j <= 60; j++) {
      const nextSecond = (seconds + j) % secondsInDay;
      if (timeMap[nextSecond]) {
        skip = true;
        break;
      }
    }
    if (skip) continue;

    for (let j = 0; j <= 60; j++) {
      const nextSecond = (seconds + j) % secondsInDay;
      timeMap[nextSecond] = true;
    }

    if (processedHeartRateData.length > 0) {
      const lastSample =
        processedHeartRateData[processedHeartRateData.length - 1];
      const lastTime = dayjs(lastSample.timestamp);
      const timeDiff = time.diff(lastTime, "minute");
      if (timeDiff >= 60) {
        const fillCount = Math.min(
          timeDiff - 1,
          1440 - processedHeartRateData.length
        );
        for (let j = 1; j <= fillCount; j++) {
          const fillTime = lastTime.add(j, "minute");
          const fillSample: HeartRateDataSample = {
            timestamp: fillTime.toISOString(),
            bpm: 0,
          };
          processedHeartRateData.push(fillSample);
        }
      }
    }

    const processedSample: HeartRateDataSample = {
      timestamp: sample.timestamp,
      bpm: sample.bpm,
    };
    processedHeartRateData.push(processedSample);

    if (processedHeartRateData.length >= 1440) {
      break;
    }
  }

  return processedHeartRateData;
}

export function processHeartRateData(heartRateSamples: HeartRateDataSample[]) {
  const newHeartRateData: HeartRateDataSample[] =
    removeTimestamps(heartRateSamples);
  return newHeartRateData;
}
