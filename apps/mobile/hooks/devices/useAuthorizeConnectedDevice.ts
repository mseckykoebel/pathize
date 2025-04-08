import {Platform} from 'react-native';
import {Connections, checkAuth} from 'terra-react';

import {DeviceConnection, DeviceResource} from '@pathize/db';
import {GetResponse} from '@pathize/api';
import {fetcher} from '../../utils';
import {getTerraDevID} from '../../lib';

export const useAuthorizeConnectedDevice = () => {
  const deleteUnauthorizedDevice = async (
    userId: string,
    accessToken: string,
    terraDeviceId: string,
    terraUserId: string,
    resource: DeviceResource,
  ) => {
    // delete the device from the database
    try {
      await fetcher(
        `api/v1/disconnectDevice?id=${terraDeviceId}&resource=${resource}&userId=${userId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
    } catch (err) {
      console.log(err);
    }

    // delete from terra
    try {
      await fetcher(
        `api/v1/deauthenticateTerraUserId?terraUserId=${terraUserId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
    } catch (err) {
      console.log(err);
    }
  };

  const authorizeConnectedDevice = async (
    userId: string,
    accessToken: string,
  ) => {
    try {
      const response: GetResponse<DeviceConnection> = await fetcher(
        `api/v1/getConnectedDevices?userId=${userId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const connectedDevice = response.data as DeviceConnection;

      // check to see if this terra ID is authorized on this device
      if (Platform.OS === 'ios' && connectedDevice.resource === 'APPLE') {
        const checkAppleAuth = await checkAuth(
          Connections.APPLE_HEALTH,
          getTerraDevID(),
        );

        if (checkAppleAuth.success === true) {
          console.log('Apple health is connected, not resetting device');
        } else {
          console.log('Apple health is not connected, resetting device!!!!');
          return await deleteUnauthorizedDevice(
            userId,
            accessToken,
            connectedDevice.id,
            connectedDevice.terraUserId,
            connectedDevice.resource,
          );
        }
      }
    } catch (err) {}
  };

  return {authorizeConnectedDevice};
};
