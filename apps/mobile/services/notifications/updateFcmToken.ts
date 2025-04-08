import {PatchResponse} from '@pathize/api';
import {FcmToken} from '@pathize/db';
import {ServiceObjectMessage} from '../../types';
import {fetcher} from '../../utils/fetcher';

export async function updateFcmToken(
  accessToken: string,
  id: string,
  token: string,
): Promise<ServiceObjectMessage> {
  try {
    const response: PatchResponse<FcmToken> = await fetcher(
      `api/v1/updateFcmToken?id=${id}&token=${token}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (response.status === 200) {
      return {
        success: true,
        data: response.data as FcmToken,
      };
    }

    console.log('response', response);

    return {
      success: false,
      error: 'There was an issue updating this FCM token.',
    };
  } catch (err) {
    console.log('err', err);
    return {
      success: false,
      error: 'There was an issue updating this FCM token.',
    };
  }
}
