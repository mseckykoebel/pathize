import {UserPreference} from '@pathize/db';
import {fetcher} from '../../utils';
import {GetResponse} from '@pathize/api';

export const getUserPreferences = async (
  userId: string,
  accessToken: string,
) => {
  try {
    const userPreferences: GetResponse<UserPreference> = await fetcher(
      `/api/v1/getUserPreferences?userId=${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    if (userPreferences.status === 404 || userPreferences.status === 500) {
      return null;
    }
    return userPreferences.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};
