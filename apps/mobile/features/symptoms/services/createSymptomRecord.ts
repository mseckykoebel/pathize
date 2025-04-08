import {CreateResponse} from '@pathize/api';
import {SymptomRecord} from '@pathize/db';

import {fetcher} from '../../../utils';

export async function createSymptomRecord(
  userId: string,
  accessToken: string,
  time: Date,
  createdDay: string,
  symptomId: string | null,
  userSymptomId: string,
  symptomSeverity: number,
  symptomName: string,
  symptomDescription: string | null,
  symptomCategory: string,
  checkInId?: string,
) {
  const responseBody = JSON.stringify({
    userId: userId,
    time: time,
    createdDay: createdDay,
    symptomId: symptomId,
    userSymptomId: userSymptomId,
    symptomSeverity: symptomSeverity,
    symptomName: symptomName,
    symptomDescription: symptomDescription,
    symptomCategory: symptomCategory,
    ...(checkInId ? {checkInId: checkInId} : {}),
  });

  try {
    const response: CreateResponse<SymptomRecord> = await fetcher(
      'api/v1/createSymptomRecord',
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
        data: response.data as SymptomRecord,
      };
    }

    return {
      success: false,
      error:
        'There was an issue creating your symptom record. Please try again.',
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      error:
        'There was an issue creating your symptom record. Please try again.',
    };
  }
}
