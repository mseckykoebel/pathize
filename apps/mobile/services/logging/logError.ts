import {PostResponse} from '@pathize/api';
import {ServiceObjectMessage} from '../../types';
import {fetcher} from '../../utils';

export async function logError(
  userId: string,
  accessToken: string,
  message: string,
): Promise<ServiceObjectMessage> {
  try {
    const response: PostResponse<string> = await fetcher(
      `api/v1/logging?userId=${userId}&message=${message}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    //TODO: logging is just a string now, but in the future we can save errors to the DB
    const data = {
      data: response.data,
    };

    if (response.status === 200) {
      return {
        success: true,
        data: data,
      };
    }

    return {
      success: false,
      error: 'There was an issue logging this error.',
    };
  } catch (err) {
    console.log('err', err);
    return {
      success: false,
      error: 'There was an issue logging this error.',
    };
  }
}
