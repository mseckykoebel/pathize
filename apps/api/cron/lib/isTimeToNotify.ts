import { utcToZonedTime, format } from "date-fns-tz";
/**
 * Checks if the current server time matches the notification time
 */
export function isTimeToNotify(notificationTime: Date): boolean {
  // Get the current server time, and see if it matches the notification time
  const currentServerTime = new Date();
  return (
    currentServerTime.getHours() === notificationTime.getHours() &&
    currentServerTime.getMinutes() === notificationTime.getMinutes()
  );
}

export function isTimeToNotifyWithTimezone(
  notificationTime: Date,
  timezone: string | null
): boolean {
  if (!timezone) {
    return false;
  }
  // Convert the notification UTC time to the user's local time with the timezone
  const notificationTimeInUserZone = utcToZonedTime(notificationTime, timezone);

  // Get the current server time in UTC, and convert it to the user's local time with the timezone
  const currentServerTime = new Date();
  const currentServerTimeInUserZone = utcToZonedTime(
    currentServerTime,
    timezone
  );

  // Compare only the hours and minutes to see if they match
  const notificationTimeFormatted = format(
    notificationTimeInUserZone,
    "HH:mm",
    { timeZone: timezone }
  );
  const currentTimeFormatted = format(currentServerTimeInUserZone, "HH:mm", {
    timeZone: timezone,
  });

  return notificationTimeFormatted === currentTimeFormatted;
}
