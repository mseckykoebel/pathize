import type {LineChartPoint} from '../types';

export function getDomain(rows: LineChartPoint[]): [number, number] {
  'worklet';
  const yValues = rows.map(({y}) => y);
  return [Math.min(...yValues), Math.max(...yValues)];
}
