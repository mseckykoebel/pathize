import {ServiceObjectMessage} from '../../../types';
import {fetcher} from '../../../utils';

export async function deleteCheckIn(
  checkInId: string,
  accessToken: string,
): Promise<ServiceObjectMessage> {
  try {
    const response = await fetcher(`api/v1/deleteCheckIn?id=${checkInId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 404) {
      return {
        success: false,
        error:
          'There was an issue deleting this check-in - the check-in was not found. Please make sure this check-in exists and try again.',
      };
    }

    return {
      success: true,
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      error: 'There was an issue deleting this check-in. Please try again.',
    };
  }
}
