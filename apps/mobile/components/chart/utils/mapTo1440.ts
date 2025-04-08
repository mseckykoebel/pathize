export function mapTo1440(currentVal: number, maxVal: number): number {
  'worklet';
  const ratio = 1440 / maxVal;
  return Math.trunc(currentVal * ratio);
}
