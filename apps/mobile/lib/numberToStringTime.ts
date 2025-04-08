export function numberToStringTime(minutes: number): string {
  if (minutes === 0) return '-';
  if (minutes === 24 * 60) return 'All day';

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} minutes`;
  } else if (remainingMinutes === 0) {
    return `${hours} ${hours > 1 ? 'hours' : 'hour'}`;
  } else {
    return `${hours} ${
      hours > 1 ? 'hours' : 'hour'
    }, ${remainingMinutes} minutes`;
  }
}
