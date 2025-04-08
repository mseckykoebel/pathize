import {GetResponse} from '@pathize/api';
import {MedicationRecord} from '@pathize/db';

import {fetcher} from '../../../utils';
import {ServiceArrayMessage} from '../../../types';

export async function getMedicationRecords(
  userId: string,
  accessToken: string,
  day?: string,
  checkInId?: string,
): Promise<ServiceArrayMessage> {
  const queryString = `api/v1/getMedicationRecords?userId=${userId}${
    day ? `&day=${day}` : ''
  }${checkInId ? `&checkInId=${checkInId}` : ''}`;

  try {
    const response: GetResponse<MedicationRecord> = await fetcher(queryString, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 200) {
      return {
        success: true,
        data: response.data as MedicationRecord[],
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
      error: 'There was an issue fetching your medications. Please try again.',
    };
  } catch (err) {
    return {
      success: false,
      error: 'There was an issue fetching your medications. Please try again.',
    };
  }
}
