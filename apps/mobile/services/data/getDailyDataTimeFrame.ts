import {Connections, getDaily, initTerra} from 'terra-react';
import dayjs from 'dayjs';

import {getTerraDevID} from '../../lib';

export const getDailyDataTimeFrame = async (
  userId: string,
  startTime: string,
  endTime: string,
) => {
  await initTerra(getTerraDevID(), userId);

  const data = await getDaily(
    Connections.APPLE_HEALTH,
    dayjs(startTime).toDate(),
    dayjs(endTime).toDate(),
    false,
  );

  if (data.error && data.error === 'Unauthenticated') return null;
  if (data.success === false) return null;

  return data.data;
};
