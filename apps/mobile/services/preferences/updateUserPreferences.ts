import {UserPreference} from '@pathize/db';
import {fetcher} from '../../utils';
import {PatchResponse} from '@pathize/api';

const updateUserPreferences = async (
  userId: string,
  accessToken: string,
  notificationsEnabled: boolean,
) => {
  try {
    const updatePreferences: PatchResponse<UserPreference> = await fetcher(
      `api/v1/updateUserPreferences?userId=${userId}&notificationsEnabled=${notificationsEnabled}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    // if contains status, return null
    if (updatePreferences.status === 500) return null;
    return updatePreferences;
  } catch (error) {
    return null;
  }
};

export default updateUserPreferences;
