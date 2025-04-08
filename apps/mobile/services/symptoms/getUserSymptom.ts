import {GetResponse} from '@pathize/api';
import {UserSymptom} from '@pathize/db';
import {fetcher} from '../../utils';
import {ServiceObjectMessage} from '../../types';

export async function getUserSymptom(
  userSymptomId: string,
  accessToken: string,
): Promise<ServiceObjectMessage> {
  const errorMessage = {
    success: false,
    error: 'There was an issue fetching this symptom. Please try again.',
  };

  try {
    const response: GetResponse<UserSymptom> = await fetcher(
      `api/v1/getUserSymptom?id=${userSymptomId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (response.status === 200) {
      return {
        success: true,
        data: response.data as UserSymptom,
      };
    }

    if (response.status === 404) {
      return {
        success: false,
        error:
          'There was an issue fetching this symptom - the symptom was not found. Please make sure this symptom exists and try again.',
      };
    }

    return errorMessage;
  } catch (err) {
    return errorMessage;
  }
}
