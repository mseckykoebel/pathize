import {GetResponse} from '@pathize/api';
import {SymptomRecord} from '@pathize/db';

import {fetcher} from '../../../utils';
import {ServiceArrayMessage} from '../../../types';

export async function getSymptomRecords(
  userId: string,
  accessToken: string,
  day?: string,
  checkInId?: string,
): Promise<ServiceArrayMessage> {
  const queryString = `api/v1/getSymptomRecords?userId=${userId}${
    day ? `&day=${day}` : ''
  }${checkInId ? `&checkInId=${checkInId}` : ''}`;

  try {
    const response: GetResponse<SymptomRecord> = await fetcher(queryString, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 200) {
      return {
        success: true,
        data: response.data as SymptomRecord[],
      };
    }

    if (response.status === 404) {
      return {
        success: true,
        data: [],
      };
    }

    return {
      success: false,
      error: 'There was an issue fetching your symptoms. Please try again.',
    };
  } catch (err) {
    return {
      success: false,
      error: 'There was an issue fetching your symptoms. Please try again.',
    };
  }
}
