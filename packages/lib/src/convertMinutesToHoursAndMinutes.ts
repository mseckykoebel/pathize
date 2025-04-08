export function convertMinutesToHoursAndMinutes(n: number) {
  const num = n;
  const hours = num / 60 / 60;
  const rhours = Math.floor(hours);
  const minutes = (hours - rhours) * 60;
  const rminutes = Math.round(minutes);
  return rhours + " hours and " + rminutes + " minutes";
}
