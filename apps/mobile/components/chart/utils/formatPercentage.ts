export function formatPercentage(n: number): string {
  'worklet';
  return `${n.toPrecision(2).toLocaleString()}%`;
}

export function formatPercentageNoUnit(n: number): string {
  'worklet';
  return `${n.toPrecision(2).toLocaleString()}`;
}
