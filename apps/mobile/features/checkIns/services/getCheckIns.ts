import {GetResponse} from '@pathize/api';
import {CheckInComplete} from '@pathize/db';
import {fetcher} from '../../../utils';
import {ServiceArrayMessage} from '../../../types';

export async function getCheckIns(
  userId: string,
  accessToken: string,
): Promise<ServiceArrayMessage> {
  try {
    const response: GetResponse<CheckInComplete> = await fetcher(
      `api/v1/getCheckIns?userId=${userId}`,
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
