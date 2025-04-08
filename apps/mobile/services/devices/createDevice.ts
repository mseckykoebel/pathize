import {DeviceConnection} from '@pathize/db';
import {ServiceObjectMessage} from '../../types';
import {fetcher} from '../../utils/fetcher';

export async function createDevice(
  userId: string,
  accessToken: string,
  terraUserId: string,
  resource: string,
): Promise<ServiceObjectMessage<DeviceConnection>> {
  const body = JSON.stringify({
    userId: userId,
    terraUserId: terraUserId,
    resource: resource,
  });
  try {
    const response: DeviceConnection = await fetcher(
      'api/v1/createDeviceConnection',
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: body,
      },
    );

    return {
      success: true,
      data: response,
    };
  } catch (err) {
    return {
      success: false,
      error: 'There was an issue creating your device. Please try again.',
    };
  }
}
