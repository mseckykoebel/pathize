/**
 * @description get the average value of an array of numbers
 */
export function getAverageValue(
  data: (number | undefined)[],
  filterOurZeroes = false,
): number | undefined {
  const validData = data.filter(
    item => item !== undefined && (!filterOurZeroes || item !== 0),
  ) as number[];
  if (validData.length === 0) return undefined;
  const sum = validData.reduce((a, b) => a + b, 0);
  const result = Math.trunc(sum / validData.length);
  // if negative 100, return undefined
  if (result === -100) return undefined;
  return result;
}
