import {CreateResponse} from '@pathize/api';
import {CheckInComplete} from '@pathize/db';
import {fetcher} from '../../../utils';
import {ServiceObjectMessage} from '../../../types';

export async function createCheckIn(
  userId: string,
  name: string,
  time: Date,
  notificationsEnabled: boolean = true,
  userMedicationIds: string[],
  userSymptomIds: string[],
  accessToken: string,
): Promise<ServiceObjectMessage> {
  try {
    const response: CreateResponse<CheckInComplete> = await fetcher(
      'api/v1/createCheckIn',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          name: name,
          time: time,
          notificationsEnabled: notificationsEnabled,
          userMedicationIds: userMedicationIds,
          userSymptomIds: userSymptomIds,
        }),
      },
    );

    if (response.status === 200) {
      return {
        success: true,
        data: response.data as CheckInComplete,
      };
    }

    return {
      success: false,
      error: 'There was an issue creating your check-in. Please try again.',
    };
  } catch (err) {
    return {
      success: false,
      error: 'There was an issue creating your check-in. Please try again.',
    };
  }
}
