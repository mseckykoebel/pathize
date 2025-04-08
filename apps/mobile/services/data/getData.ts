import {Connections, getDaily, DataMessage, getSleep} from 'terra-react';
import {Daily} from 'terra-api/lib/cjs/models/Daily';
import {Sleep} from 'terra-api/lib/cjs/models/Sleep';
import dayjs from 'dayjs';

/**
 * @description gets terra daily data bundle for a specific day, and resolves to null if it takes longer than 3 seconds
 */
export const getDailyData = async (startTime: string) => {
  const day = dayjs(startTime).toDate();
  const dayAfter = dayjs(startTime).add(1, 'day').toDate();

  let data: DataMessage | null = null;
  do {
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      data = await getDaily(Connections.APPLE_HEALTH, day, dayAfter, false);
    } catch (err) {
      return null;
    }
  } while (data && data.error && data.error === 'Unauthenticated');

  if (!data || data.success === false) return null;

  return (
    (data.data as Record<string, string | unknown>).data as Daily[]
  ).pop();
};

/**
 * @description gets terra sleep data bundle for a specific day, and resolves to null if it takes longer than 3 seconds
 */
export const getSleepData = async (startTime: string) => {
  const day = dayjs(startTime).toDate();
  const dayAfter = dayjs(startTime).add(1, 'day').toDate();

  let data: DataMessage | null = null;
  do {
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      data = await getSleep(Connections.APPLE_HEALTH, day, dayAfter, false);
    } catch (err) {
      return null;
    }
  } while (data && data.error && data.error === 'Unauthenticated');

  if (!data || data.success === false) return null;

  return (
    (data.data as Record<string, string | unknown>).data as Sleep[]
  ).pop();
};
