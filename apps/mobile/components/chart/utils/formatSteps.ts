export function formatSteps(n: number): string {
  'worklet';
  return `${Math.trunc(n).toLocaleString()} steps`;
}

export function formatStepsNoUnit(n: number): string {
  'worklet';
  return `${Math.trunc(n).toLocaleString()}`;
}
