import {HeartRateDataSample} from 'terra-api/lib/cjs/models/samples/HeartRateDataSample';

/**
 * @deprecated: this is the old algorithm
 * replaced with getTimeAboveLimit in the `/lib` package
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getTimeAboveLimit(
  heartRateData: HeartRateDataSample[],
  limit: number,
) {
  let timeAboveLimit = 0;
  for (let i = 0; i < heartRateData.length - 1; i++) {
    // if bpm is zero, skip
    if (heartRateData[i].bpm === 0 && heartRateData[i + 1].bpm === 0) continue;

    const timestamp = new Date(heartRateData[i].timestamp).getTime();
    const nextTimestamp = new Date(heartRateData[i + 1].timestamp).getTime();
    const diff = (nextTimestamp - timestamp) / 1000;
    const bpm = heartRateData[i].bpm;
    const nextBpm = heartRateData[i + 1].bpm;

    if (bpm >= limit && nextBpm >= limit) {
      timeAboveLimit += diff;
    } else if (bpm >= limit && nextBpm < limit) {
      timeAboveLimit += diff / 2;
    } else if (bpm < limit && nextBpm >= limit) {
      timeAboveLimit += diff / 2;
    }
  }

  return timeAboveLimit;
}
