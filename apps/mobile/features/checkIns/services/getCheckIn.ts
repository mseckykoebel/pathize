import {GetResponse} from '@pathize/api';
import {CheckInComplete} from '@pathize/db';
import {fetcher} from '../../../utils';
import {ServiceObjectMessage} from '../../../types';

export async function getCheckIn(
  checkInId: string,
  accessToken: string,
): Promise<ServiceObjectMessage> {
  try {
    const response: GetResponse<CheckInComplete> = await fetcher(
      `api/v1/getCheckIn?id=${checkInId}`,
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
        data: response.data as CheckInComplete,
      };
    }

    if (response.status === 404) {
      return {
        success: true,
        data: undefined,
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
