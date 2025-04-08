import {HeartRateDataSample} from 'terra-api/lib/cjs/models/samples/HeartRateDataSample';
import {getTimeAboveLimit} from '@pathize/lib';

export const getMetadata = (
  heartSamples: HeartRateDataSample[],
  limit: number,
) => {
  const timeAboveLimit = getTimeAboveLimit(heartSamples, limit);
  let maxHr = heartSamples[0].bpm;
  let minHr = heartSamples[0].bpm;

  heartSamples.forEach(sample => {
    if (sample.bpm > maxHr) {
      maxHr = sample.bpm;
    }
    if (sample.bpm < minHr) {
      minHr = sample.bpm;
    }
  });

  return {
    timeAboveLimit: timeAboveLimit,
    maxHr: maxHr,
    minHr: minHr,
  };
};
