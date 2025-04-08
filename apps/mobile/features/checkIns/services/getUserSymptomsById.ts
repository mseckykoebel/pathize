import {UserSymptom} from '@pathize/db';
import {getUserSymptom} from '../../../services';
import {ServiceArrayMessage} from '../../../types';

/**
 * @description - based on the userSymptomIds, fetch the userSymptoms and return them as an array
 */
export async function getUserSymptomsById(
  userSymptomIds: string[],
  accessToken: string,
): Promise<ServiceArrayMessage> {
  if (!userSymptomIds.length) {
    return {
      success: true,
      data: [],
    };
  }

  try {
    const responses = await Promise.all(
      userSymptomIds.map(async userSymptomId => {
        const response = await getUserSymptom(userSymptomId, accessToken);
        return response.data;
      }),
    );

    // filter out undefined to satisfy type
    const userSymptoms = responses.filter(Boolean) as UserSymptom[];
    return {
      success: true,
      data: userSymptoms,
    };
  } catch (err) {
    return {
      success: false,
      error: 'There was an issue fetching your symptoms. Please try again.',
    };
  }
}
