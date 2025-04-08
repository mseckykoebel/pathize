import {Connections, DataMessage, getDaily, getSleep} from 'terra-react';
import {Daily} from 'terra-api/lib/cjs/models/Daily';
import {Sleep} from 'terra-api/lib/cjs/models/Sleep';
import dayjs from 'dayjs';

/**
 * @description gets terra daily data bundle for a specific time period, and resolves to null if it takes longer than 3 seconds
 */
export const getDailyDataTimeFrame = async (
  startTime: string,
  endTime: string,
) => {
  const startDay = dayjs(startTime).toDate();
  const endDay = dayjs(endTime).add(1, 'day').toDate();

  let data: DataMessage | null = null;
  do {
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      data = await getDaily(Connections.APPLE_HEALTH, startDay, endDay, false);
    } catch (err) {
      return null;
    }
  } while (data && data.error && data.error === 'Unauthenticated');

  if (!data || data.success === false) return null;

  return (data.data as Record<string, string | unknown>).data as Daily[];
};

/**
 * @description gets terra sleep data bundle for a specific time period, and resolves to null if it takes longer than 3 seconds
 */
export const getSleepDataTimeFrame = async (
  startTime: string,
  endTime: string,
) => {
  const startDay = dayjs(startTime).toDate();
  const endDay = dayjs(endTime).add(1, 'day').toDate();

  let data: DataMessage | null = null;
  do {
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      data = await getSleep(Connections.APPLE_HEALTH, startDay, endDay, false);
    } catch (err) {
      return null;
    }
  } while (data && data.error && data.error === 'Unauthenticated');

  if (!data || data.success === false) return null;

  return (data.data as Record<string, string | unknown>).data as Sleep[];
};
