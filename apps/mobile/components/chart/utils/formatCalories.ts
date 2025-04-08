export function formatCalories(n: number): string {
  'worklet';
  return `${Math.trunc(n).toLocaleString()} cal`;
}

export function formatCaloriesNoUnit(n: number): string {
  'worklet';
  return `${Math.trunc(n).toLocaleString()}`;
}
