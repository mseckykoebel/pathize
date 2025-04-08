import {fetcher} from '../../utils/fetcher';
import {FcmToken} from '@pathize/db';

const getFcmTokens = async (userId: string, accessToken: string) => {
  try {
    const response: FcmToken[] = await fetcher(
      `api/v1/getFcmTokens?userId=${userId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return response;
  } catch (err) {
    return [];
  }
};

export default getFcmTokens;
