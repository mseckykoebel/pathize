export function getHoursAndMinutes(n: number) {
  let numHours = Math.floor(n / 60);
  let numMinutes = n % 60;

  numHours = numHours ? numHours : 0;
  numMinutes = numMinutes ? numMinutes : 0;

  return { numHours, numMinutes };
}
