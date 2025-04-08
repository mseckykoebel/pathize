export function subtractTime(
  time: string,
  numHours: number,
  numMinutes: number,
): string {
  console.log("time: ", time);
  console.log("numHours: ", numHours);
  console.log("numMinutes: ", numMinutes);
  const [hourStr, minuteStr] = time.split(" ")[0].split(":");
  let amPm = time.split(" ")[1];
  let hour = parseInt(hourStr);
  let minute = parseInt(minuteStr);

  // Subtract minutes
  minute -= numMinutes;
  while (minute < 0) {
    minute += 60;
    hour -= 1;
  }

  // Subtract hours
  hour -= numHours;
  while (hour <= 0) {
    hour += 12;
    if (numHours !== 0) {
      amPm = amPm === "AM" ? "PM" : "AM";
    }
  }

  return `${hour}:${minute.toString().padStart(2, "0")} ${amPm ?? ""}`;
}
