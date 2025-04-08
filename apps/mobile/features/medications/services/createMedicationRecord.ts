import {CreateResponse} from '@pathize/api';
import {MedicationRecord} from '@pathize/db';

import {fetcher} from '../../../utils';

export async function createMedicationRecord(
  userId: string,
  accessToken: string,
  time: Date,
  createdDay: string,
  medicationId: string | null | undefined,
  userMedicationId: string | null | undefined,
  medicationName: string,
  type: string,
  unit: string,
  strength: number,
  checkInId?: string,
) {
  const responseBody = JSON.stringify({
    userId: userId,
    time: time,
    createdDay: createdDay,
    medicationId: medicationId,
    userMedicationId: userMedicationId,
    medicationName: medicationName,
    type: type,
    unit: unit,
    strength: strength,
    ...(checkInId ? {checkInId: checkInId} : {}),
  });

  try {
    const response: CreateResponse<MedicationRecord> = await fetcher(
      'api/v1/createMedicationRecord',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: responseBody,
      },
    );

    if (response.status === 200) {
      return {
        success: true,
        data: response.data as MedicationRecord,
      };
    }

    return {
      success: false,
      error:
        'There was an issue creating your medication record. Please try again.',
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      error:
        'There was an issue creating your medication record. Please try again.',
    };
  }
}
