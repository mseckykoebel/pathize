import {Error, UserPreference} from '@pathize/db';
import {fetcher} from '../../utils';

export const createUserPreferences = async (
  userId: string,
  accessToken: string,
) => {
  try {
    const userPreferences: UserPreference | Error = await fetcher(
      `api/v1/createUserPreferences?userId=${userId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    if (
      (userPreferences as Error).status === 404 ||
      (userPreferences as Error).status === 500
    ) {
      return null;
    }

    return userPreferences as UserPreference;
  } catch (err) {
    console.error(err);
    return null;
  }
};
