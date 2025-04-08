export const convertTimestampToTime = (dateString: string) => {
  const timeString = dateString.slice(
    dateString.indexOf("T") + 1,
    dateString.indexOf(":", dateString.indexOf(":") + 1),
  );
  const initHour = parseInt(timeString.split(":")[0]);
  let hour = parseInt(timeString.split(":")[0]);
  const minute = timeString.split(":")[1];

  if (hour > 12) {
    hour -= 12;
  } else if (hour === 0) {
    hour = 12;
  }

  hour = Number(hour.toString().replace(/^0+/, ""));

  if (hour === 1) {
    hour = Number("0" + hour);
  }

  const finalTimeString = hour + ":" + minute + (initHour < 12 ? "AM" : " PM");

  return finalTimeString;
};
