import {PatchResponse} from '@pathize/api';
import {CheckInComplete} from '@pathize/db';
import {fetcher} from '../../../utils';
import {ServiceObjectMessage} from '../../../types';

export async function updateCheckIn(
  checkInId: string,
  name: string,
  time: Date,
  notificationsEnabled: boolean = true,
  userMedicationIds: string[],
  userSymptomIds: string[],
  accessToken: string,
): Promise<ServiceObjectMessage> {
  try {
    const response: PatchResponse<CheckInComplete> = await fetcher(
      'api/v1/updateCheckIn',
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: checkInId,
          name: name,
          time: time,
          notificationsEnabled: notificationsEnabled,
          userMedicationIds: userMedicationIds,
          userSymptomIds: userSymptomIds,
        }),
      },
    );

    console.log(response);

    if (response.status === 200) {
      return {
        success: true,
        data: response.data as CheckInComplete,
      };
    }

    if (response.status === 404) {
      return {
        success: false,
        error:
          'There was an issue updating your check-in - the check in was not found. Please make sure this check-in exists and try again.',
      };
    }

    return {
      success: false,
      error: 'There was an issue updating your check-in. Please try again.',
    };
  } catch (err) {
    return {
      success: false,
      error: 'There was an issue updating your check-in. Please try again.',
    };
  }
}
