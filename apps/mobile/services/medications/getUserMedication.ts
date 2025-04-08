import {GetResponse} from '@pathize/api';
import {UserMedication} from '@pathize/db';
import {fetcher} from '../../utils';

export async function getUserMedication(
  userMedicationId: string,
  accessToken: string,
): Promise<GetResponse<UserMedication>> {
  return await fetcher(`api/v1/getUserMedication?id=${userMedicationId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
