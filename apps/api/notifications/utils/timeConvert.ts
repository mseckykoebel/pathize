export function timeConvert(n: number) {
  const num = n;
  const hours = num / 60 / 60;
  const numHours = Math.floor(hours);
  const minutes = (hours - numHours) * 60;
  const numMinutes = Math.round(minutes);
  return { numHours, numMinutes };
}
