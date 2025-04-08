import {GetResponse} from '@pathize/api';
import {CheckInComplete} from '@pathize/db';
import {fetcher} from '../../../utils';
import {ServiceArrayMessage} from '../../../types';

/**
 * @param date formatted YYYY-MM-DD
 */
export async function getCheckInsRecordedOnDay(
  userId: string,
  accessToken: string,
  date: string,
): Promise<ServiceArrayMessage<CheckInComplete>> {
  try {
    const response: GetResponse<CheckInComplete> = await fetcher(
      `api/v1/getCheckInsRecordedOnDay?userId=${userId}&date=${date}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (response.status === 200) {
      return {
        success: true,
        data: response.data as CheckInComplete[],
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
      error: 'There was an issue fetching your check-ins. Please try again.',
    };
  } catch (err) {
    return {
      success: false,
      error: 'There was an issue fetching your check-ins. Please try again.',
    };
  }
}
