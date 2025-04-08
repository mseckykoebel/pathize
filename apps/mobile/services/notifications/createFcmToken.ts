import {PostResponse} from '@pathize/api';
import {FcmToken} from '@pathize/db';
import {ServiceObjectMessage} from '../../types';
import {fetcher} from '../../utils/fetcher';

export async function createFcmToken(
  userId: string,
  accessToken: string,
  token: string,
): Promise<ServiceObjectMessage> {
  const body = JSON.stringify({
    userId,
    token,
  });

  try {
    const response: PostResponse<FcmToken> = await fetcher(
      'api/v1/createFcmToken',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body,
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
      error: 'There was an issue creating this FCM token.',
    };
  } catch (err) {
    console.log('err', err);
    return {
      success: false,
      error: 'There was an issue creating this FCM token.',
    };
  }
}
