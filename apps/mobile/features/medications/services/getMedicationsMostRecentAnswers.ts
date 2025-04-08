import dayjs from 'dayjs';

import {MedicationRecord} from '@pathize/db';
import {ServiceArrayMessage} from '../../../types';
import {getMedicationRecords} from '..';

export async function getMedicationsMostRecentAnswers(
  userId: string,
  accessToken: string,
  checkInId?: string,
): Promise<ServiceArrayMessage> {
  // first, get all medications and symptoms associated with this check-in
  try {
    const medications = await getMedicationRecords(
      userId,
      accessToken,
      undefined,
      checkInId,
    );

    if (!medications.success) {
      return {
        success: false,
        error:
          'There was an issue fetching the answers for your most recent medications. Please try again in a few moments.',
      };
    }

    const sortedMedications = (medications.data as MedicationRecord[]).sort(
      (a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt)),
    );

    const uniqueMostRecentMedicationsMap = new Map<string, MedicationRecord>();

    sortedMedications.forEach(medication => {
      const existingMedication = uniqueMostRecentMedicationsMap.get(
        medication.userMedicationId as string,
      );
      if (
        !existingMedication ||
        dayjs(medication.createdAt).isAfter(dayjs(existingMedication.createdAt))
      ) {
        uniqueMostRecentMedicationsMap.set(
          medication.userMedicationId as string,
          medication,
        );
      }
    });

    const uniqueMostRecentMedications = Array.from(
      uniqueMostRecentMedicationsMap.values(),
    );

    return {
      success: true,
      data: uniqueMostRecentMedications,
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      error:
        'There was an issue fetching the answers for your most recent medications. Please try again in a few moments.',
    };
  }
}
