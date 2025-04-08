import {HeartRateDataSample} from 'terra-api/lib/cjs/models/samples/HeartRateDataSample';

type Data = {
  x: number;
  y: number;
};

type DataKeepTimestamps = {
  timestamp: string;
  value: number;
};

export function formatHeartRateDataSamples(
  samples: HeartRateDataSample[],
): Data[] {
  const formattedData: Data[] = [];
  samples.forEach(item => {
    const timeParts = item.timestamp.split('T')[1].split(':');
    const hours = Number(timeParts[0]);
    const minutes = Number(timeParts[1]);
    const x = hours * 60 + minutes;
    const y = Number(item.bpm);
    formattedData.push({x, y});
  });
  return formattedData;
}

export function formatHeartRateDataSamplesKeepTimestamps(
  samples: HeartRateDataSample[],
): DataKeepTimestamps[] {
  'worklet';
  const formattedData: DataKeepTimestamps[] = [];
  samples.forEach(item => {
    const value = item.bpm;
    const timestamp = item.timestamp;
    formattedData.push({timestamp, value});
  });
  return formattedData;
}
