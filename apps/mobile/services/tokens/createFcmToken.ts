import {fetcher} from '../../utils/fetcher';
import {FcmToken} from '@pathize/db';

const createFcmToken = async (
  userId: string,
  accessToken: string,
  token: string,
) => {
  try {
    const body = JSON.stringify({userId, token});
    const response: FcmToken = await fetcher('api/v1/createFcmToken', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body,
    });
    return response;
  } catch (err) {
    return null;
  }
};

export default createFcmToken;
