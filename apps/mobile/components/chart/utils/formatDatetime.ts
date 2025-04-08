const getDay = (dataLength: number, num: number) => {
  'worklet';
  const today = new Date();
  const adjustedNum = num - dataLength; // subtract the input from 13
  today.setDate(today.getDate() - adjustedNum); // subtract the result from the current date
  return today;
};

export function formatDatetime({
  value,
  dataLength,
  locale = 'en-US',
  options = {},
}: {
  value: number;
  dataLength: number;
  locale?: string;
  options?: Intl.DateTimeFormatOptions;
}) {
  'worklet';
  const d = getDay(value, dataLength);
  return d.toLocaleString(locale, options);
}
