import dayjs from 'dayjs';

import {SymptomRecord} from '@pathize/db';
import {ServiceArrayMessage} from '../../../types';
import {getSymptomRecords} from '..';

export async function getSymptomsMostRecentAnswers(
  userId: string,
  accessToken: string,
  checkInId?: string,
): Promise<ServiceArrayMessage> {
  // first, get all symptoms and symptoms associated with this check-in
  try {
    const symptoms = await getSymptomRecords(
      userId,
      accessToken,
      undefined,
      checkInId,
    );

    if (!symptoms.success) {
      return {
        success: false,
        error:
          'There was an issue fetching the answers for your most recent symptoms. Please try again in a few moments.',
      };
    }

    const sortedSymptoms = (symptoms.data as SymptomRecord[]).sort((a, b) =>
      dayjs(b.createdAt).diff(dayjs(a.createdAt)),
    );
    const uniqueMostRecentSymptomsMap = new Map<string, SymptomRecord>();

    sortedSymptoms.forEach(symptom => {
      const existingSymptom = uniqueMostRecentSymptomsMap.get(
        symptom.userSymptomId as string,
      );
      if (
        !existingSymptom ||
        dayjs(symptom.createdAt).isAfter(dayjs(existingSymptom.createdAt))
      ) {
        uniqueMostRecentSymptomsMap.set(
          symptom.userSymptomId as string,
          symptom,
        );
      }
    });

    const uniqueMostRecentSymptoms = Array.from(
      uniqueMostRecentSymptomsMap.values(),
    );

    return {
      success: true,
      data: uniqueMostRecentSymptoms,
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      error:
        'There was an issue fetching the answers for your most recent check-in. Please try again in a few moments.',
    };
  }
}
