import {FcmToken} from '@pathize/db';
import {GetResponse} from '@pathize/api';

import {ServiceArrayMessage} from '../../types';
import {fetcher} from '../../utils/fetcher';

export async function getFcmTokens(
  userId: string,
  accessToken: string,
): Promise<ServiceArrayMessage> {
  try {
    const response: GetResponse<FcmToken> = await fetcher(
      `api/v1/getFcmTokens?userId=${userId}`,
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
        data: response.data as FcmToken[],
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
      error:
        'There was an issue getting the list of FCM tokens saved on our database.',
    };
  } catch (err) {
    console.log('ERROR GETTING FCM TOKENS: ', err);
    return {
      success: false,
      error:
        'There was an issue getting the list of FCM tokens saved on our database.',
    };
  }
}
