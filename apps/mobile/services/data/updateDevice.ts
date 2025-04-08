import {DeviceConnection} from '@pathize/db';
import {PatchResponse} from '@pathize/api';

import {ServiceObjectMessage} from '../../types';
import {fetcher} from '../../utils';

export async function updateDevice(
  id: string,
  accessToken: string,
  historicalData?: boolean,
): Promise<ServiceObjectMessage> {
  const url =
    `api/v1/updateDeviceConnection?id=${id}` +
    (historicalData !== undefined ? `&historicalData=${historicalData}` : '');

  try {
    const response: PatchResponse<DeviceConnection> = await fetcher(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 200) {
      return {
        success: true,
        data: response.data as DeviceConnection,
      };
    }

    if (response.status === 404) {
      return {
        success: false,
        error: 'Device not found.',
      };
    }

    return {
      success: false,
      error: 'There was an issue updating the devices connection.',
    };
  } catch (err) {
    return {
      success: false,
      error: 'There was an issue updating the devices connection.',
    };
  }
}
