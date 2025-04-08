import {Daily} from 'terra-api';
import {DeviceResource} from '@pathize/db';
import {fetcher} from '../utils/fetcher';

export const saveDailyToDb = async (
  data: Daily,
  userId: string,
  terraUserId: string,
  resource: DeviceResource | null,
  accessToken: string,
) => {
  try {
    const responseBody = JSON.stringify({data: data});
    await fetcher(
      `api/v1/saveDailyData?userId=${userId}&terraUserId=${terraUserId}&resource=${resource}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: responseBody,
      },
    );
  } catch (err) {
    console.error(err);
  }
};
