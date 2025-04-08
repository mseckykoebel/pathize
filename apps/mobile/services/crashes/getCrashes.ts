import {GetResponse} from '@pathize/api';
import {Crash} from '@pathize/db';

import {fetcher} from '../../utils';
import {ServiceArrayMessage} from '../../types';

/**
 * @description get all crashes that have been recorded on a specific day
 */
export async function getCrashes(
  userId: string,
  accessToken: string,
  today: string,
): Promise<ServiceArrayMessage<Crash>> {
  try {
    const response: GetResponse<Crash> = await fetcher(
      `api/v1/getAllCrashes?userId=${userId}&day=${today}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (response.status === 200 && Array.isArray(response.data)) {
      const sortedCrashes: Crash[] = response.data?.sort((a, b) => {
        return a.time > b.time ? 1 : -1;
      });

      return {
        success: true,
        data: sortedCrashes,
      };
    }

    return {
      success: false,
      error: 'Failed to get crashes',
    };
  } catch (err) {
    return {
      success: false,
      error: 'Failed to get crashes',
    };
  }
}
