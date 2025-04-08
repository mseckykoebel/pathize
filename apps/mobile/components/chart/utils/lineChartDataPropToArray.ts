import type {LineChartData, LineChartDataProp} from '../types';

export function lineChartDataPropToArray(
  dataProp: LineChartDataProp,
): LineChartData {
  'worklet';

  if (!dataProp) {
    return [];
  }

  if (Array.isArray(dataProp)) {
    return dataProp;
  }

  const data: LineChartData = [];

  Object.values(dataProp).forEach(dataSet => {
    if (dataSet) {
      data.push(...dataSet);
    }
  });

  return data;
}
