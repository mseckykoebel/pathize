export function getLimitPercentiles(
  minutesOverLimit: number, // time above it
  setMinuteLimit: number, // set by user
): number {
  const percentage = (minutesOverLimit / setMinuteLimit) * 100;
  return Math.trunc(percentage);
}
