export function formatDailyHr(value: number): string {
  'worklet';
  return `${Math.trunc(value)} bpm`;
}

export function formatDailyHrNoUnit(value: number): string {
  'worklet';
  return `${Math.trunc(value)}`;
}
