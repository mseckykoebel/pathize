export function formatDistance(n: number): string {
  'worklet';
  const metersToMiles = 0.000621371;
  return `${(n * metersToMiles).toPrecision(2).toLocaleString()} mi`;
}

export function formatDistanceNoUnit(n: number): string {
  'worklet';
  const metersToMiles = 0.000621371;
  return `${(n * metersToMiles).toPrecision(2).toLocaleString()}`;
}
