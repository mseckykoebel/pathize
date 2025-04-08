export function mapToMaxVal(currentVal: number, maxVal: number): number {
  'worklet';
  const ratio = maxVal / 1440;
  return Math.trunc(currentVal * ratio);
}
