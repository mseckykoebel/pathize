export function stringTimeToNumber(time: string): number {
  if (time === '-') return 0;
  if (time === 'All day') return 24 * 60; // Returns 1440 minutes

  // Split hours and minutes
  const [hoursPart, minutesPart] = time.split(',');

  let totalMinutes = 0;

  // If there's an "hours" part, convert it to minutes
  if (hoursPart.includes('hour')) {
    const hours = parseInt(hoursPart, 10);
    totalMinutes += hours * 60;
  }

  // If there's a "minutes" part, add it to the total
  if (minutesPart && minutesPart.includes('minute')) {
    const minutes = parseInt(minutesPart, 10);
    totalMinutes += minutes;
  }

  // If there's only a "minutes" part
  if (hoursPart.includes('minute')) {
    totalMinutes += parseInt(hoursPart, 10);
  }

  return totalMinutes;
}
