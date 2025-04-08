import {UserMedication} from '@pathize/db';
import {getUserMedication} from '../../../services';
import {ServiceArrayMessage} from '../../../types';

/**
 * @description - based on the userMedicationIds, fetch the userMedications and return them as an array
 */
export async function getUserMedicationsById(
  userMedicationIds: string[],
  accessToken: string,
): Promise<ServiceArrayMessage> {
  if (!userMedicationIds.length) {
    return {
      success: true,
      data: [],
    };
  }

  try {
    const responses = await Promise.all(
      userMedicationIds.map(async userMedicationId => {
        const response = await getUserMedication(userMedicationId, accessToken);
        return response.data;
      }),
    );

    // filter out undefined to satisfy type and return
    const userMedications = responses.filter(Boolean) as UserMedication[];
    return {
      success: true,
      data: userMedications,
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      error: 'There was an issue fetching your medications. Please try again.',
    };
  }
}
