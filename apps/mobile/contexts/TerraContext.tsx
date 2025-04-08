import React, {
  useEffect,
  useCallback,
  useContext,
  createContext,
  useState,
  Dispatch,
  SetStateAction,
} from 'react';
import {Platform} from 'react-native';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import {usePostHog} from 'posthog-react-native';
import {TerraWidgetResponse} from 'terra-api/lib/esm/API/GenerateWidgetSessions';
import {TerraAuthTokenResponse} from 'terra-api/lib/esm/API/GenerateAuthToken';
import {
  initConnection,
  CustomPermissions,
  Connections,
  getUserId,
  getDaily,
  grantedPermissions,
  getSleep,
} from 'terra-react';
import dayjs from 'dayjs';

import {GetResponse} from '@pathize/api';
import {DeviceConnection, DeviceResource} from '@pathize/db';
import {useAuth} from '../CoreNav';
import {fetcher} from '../utils';
import {useAnalytics, useAsyncStorage, useInitTerra} from '../hooks';
import {oneButtonAlert} from '../lib';
import {updateDevice} from '../services/data';
import {
  createDevice,
  generateWidgetSession,
  getTerraAuthToken,
} from '../services';

const BROWSER_PARAMS = {
  dismissButtonStyle: 'close',
  preferredBarTintColor: '#059669',
  preferredControlTintColor: '#FDF8F1',
  readerMode: false,
  animated: true,
  modalPresentationStyle: 'fullScreen',
  modalTransitionStyle: 'coverVertical',
  modalEnabled: true,
  enableBarCollapsing: false,
  showTitle: true,
  toolbarColor: '#059669',
  secondaryToolbarColor: 'black',
  navigationBarColor: 'black',
  navigationBarDividerColor: 'white',
  enableUrlBarHiding: true,
  enableDefaultShare: true,
  forceCloseOnRedirection: false,
  animations: {
    startEnter: 'slide_in_right',
    startExit: 'slide_out_left',
    endEnter: 'slide_in_left',
    endExit: 'slide_out_right',
  },
};

async function createNewConnection(authToken: string) {
  return await initConnection(Connections.APPLE_HEALTH, authToken, true, [
    1, 3, 4, 5, 6, 7, 9, 11, 14, 17, 18, 19, 20, 21, 22, 23, 25, 26, 27, 39, 40,
  ] as CustomPermissions[]);
}

function getDevicesUrl(
  userId: string,
  nonApple: boolean,
  terraResource?: DeviceResource,
) {
  if (!nonApple) {
    return `api/v1/generateWidgetSession?userId=${userId}&google=${true}&fitbit=${true}&garmin=${true}&polar=${true}&apple=${false}`;
  }

  return `api/v1/generateWidgetSession?userId=${userId}&google=${
    terraResource ? terraResource.includes('GOOGLE') : false
  }&fitbit=${terraResource ? terraResource.includes('FITBIT') : false}&garmin=${
    terraResource ? terraResource.includes('GARMIN') : false
  }&polar=${terraResource ? terraResource.includes('POLAR') : false}&apple=${
    terraResource && Platform.OS === 'ios' && terraResource
      ? terraResource.includes('APPLE')
      : false
  }`;
}

export type TerraContext = {
  // error
  error: string | null;
  setError: Dispatch<SetStateAction<string | null>>;
  //  device state
  terraDeviceLoading: boolean;
  setTerraDeviceLoading: Dispatch<SetStateAction<boolean>>;
  deleteDeviceLoading: boolean;
  setDeleteDeviceLoading: Dispatch<SetStateAction<boolean>>;
  terraDevice: DeviceConnection | null;
  setTerraDevice: Dispatch<SetStateAction<DeviceConnection | null>>;
  // FUNCTIONS
  disconnectTerraDevice: (
    terraDeviceId: string,
    terraUserId: string,
  ) => Promise<void>;
  connectTerraDevice: () => Promise<void>;
  getTerraDevice: () => Promise<void>;
  // PERMISSIONS
  getUserGrantedPermissions: () => void;
  userGrantedPermissions: String[];
};

const TerraContext = createContext<TerraContext | undefined>(undefined);

export const useTerraContext = () => {
  const context = useContext(TerraContext);
  if (context === undefined) {
    throw new Error('useTerraContext must be used within a TerraProvider');
  }

  return context;
};

export const TerraProvider = ({children}: {children: React.ReactNode}) => {
  const {identify} = useAnalytics();
  const posthog = usePostHog();
  const {userId, accessToken} = useAuth();
  const {initStatus} = useInitTerra();
  const [terraDeviceLoading, setTerraDeviceLoading] = useState<boolean>(false);
  const [deleteDeviceLoading, setDeleteDeviceLoading] =
    useState<boolean>(false);
  const [terraDevice, setTerraDevice] = useState<DeviceConnection | null>(null);
  // error
  const [error, setError] = useState<string | null>(null);

  /**
   * @description connect to a brand new device/register with us
   */
  const connectTerraDevice = useCallback(async () => {
    InAppBrowser.closeAuth();

    try {
      console.log('CONNECTING TERRA DEVICE');
      setTerraDeviceLoading(true);

      const url = getDevicesUrl(userId as string, false, terraDevice?.resource);
      const widgetSession = await generateWidgetSession(url, accessToken);
      if (!widgetSession.success) {
        setTerraDeviceLoading(false);
        oneButtonAlert('Something went wrong', widgetSession.error as string);
        return;
      }

      const widget = widgetSession.data as TerraWidgetResponse;
      const widgetUrl = widget.url;
      const isBrowserAvailable = await InAppBrowser.isAvailable();
      if (!isBrowserAvailable || !widgetUrl) {
        setError('In-app web browser is unavailable');
        setTerraDeviceLoading(false);
        setTimeout(() => {
          setError(null);
        }, 4000);
        return;
      }

      const result = await InAppBrowser.openAuth(
        widgetUrl,
        'jdxms',
        BROWSER_PARAMS,
      );
      InAppBrowser.closeAuth();

      if (result.type !== 'success') {
        setTerraDeviceLoading(false);
        oneButtonAlert('Error', 'Connection failed, please try again');
        return;
      }

      let terraUserIdFromUrl = result.url
        .split('?')[1]
        .split('&')[0]
        .split('=')[1];
      let terraResourceFromUrl = result.url
        .split('?')[1]
        .split('&')[1]
        .split('=')[1];

      // if the userId is None, it was from  Apple Health
      if (terraUserIdFromUrl === 'None') {
        const authTokenResponse = await getTerraAuthToken(accessToken);
        if (!authTokenResponse.success) {
          setTerraDeviceLoading(false);
          oneButtonAlert('Error', authTokenResponse.error as string);
          return;
        }

        const authToken = (authTokenResponse.data as TerraAuthTokenResponse)
          .token;
        const connection = await createNewConnection(authToken);
        if (!connection.success) {
          setTerraDeviceLoading(false);
          oneButtonAlert(
            'Error',
            'Connection to apple failed, please try again',
          );
          return;
        }

        const getUserIdResponse = await getUserId(Connections.APPLE_HEALTH);
        if (!getUserIdResponse || !getUserIdResponse.userId) {
          setTerraDeviceLoading(false);
          oneButtonAlert(
            'Error',
            'Connection to apple failed, please try again',
          );
          return;
        }
        terraUserIdFromUrl = getUserIdResponse.userId as string;
      }

      const createDeviceResponse = await createDevice(
        userId,
        accessToken,
        terraUserIdFromUrl,
        terraResourceFromUrl,
      );
      if (!createDeviceResponse.success) {
        setTerraDeviceLoading(false);
        oneButtonAlert('Error', 'Connection failed, please try again');
        return;
      }

      const createdDevice = createDeviceResponse.data as DeviceConnection;
      identify(userId as string);
      posthog?.capture('Device Connected', {
        $set: {connectedDevice: createdDevice.resource},
      });

      setTerraDevice(createdDevice);
      setTerraDeviceLoading(false);
    } catch (err) {
      setTerraDeviceLoading(false);
      setError('Something went wrong, please try again.');
      setTimeout(() => {
        setError(null);
      }, 4000);
    }

    // posthog is not a blocker on this
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, accessToken]);

  /**
   * @description disconnect from a device
   */
  const disconnectTerraDevice = useCallback(
    async (terraDeviceId: string, terraUserId: string) => {
      // delete user data and disconnect device
      setDeleteDeviceLoading(true);
      try {
        await fetcher(
          `api/v1/disconnectDevice?id=${terraDeviceId}&userId=${userId}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
      } catch (e) {
        setDeleteDeviceLoading(false);
        oneButtonAlert(
          'Something went wrong',
          'Something went wrong trying to disconnect from Apple Health. There might be an outage, so if this persists, please connect with us and we will try and help you out!',
        );
      }

      // deauthenticate from Terra
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
        setDeleteDeviceLoading(false);
        oneButtonAlert(
          'Something went wrong',
          'Something went wrong trying to disconnect from Apple Health. There might be an outage, so if this persists, please connect with us and we will try and help you out!',
        );
      }

      setTerraDevice(null);
      setDeleteDeviceLoading(false);
    },
    [accessToken, userId],
  );

  /**
   * @description get the terra device
   */
  const getTerraDevice = useCallback(async () => {
    setTerraDeviceLoading(true);
    try {
      const connectedDevices: GetResponse<DeviceConnection> = await fetcher(
        `api/v1/getConnectedDevices?userId=${userId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      // if status is not 200, set null
      if (connectedDevices.status === 200) {
        const connectedDevice = connectedDevices.data as DeviceConnection;
        setTerraDevice(connectedDevice);
      }
      setTerraDeviceLoading(false);
    } catch (err) {
      setTerraDeviceLoading(false);
    }
  }, [accessToken, userId]);

  const [userGrantedPermissions, setUserGrantedPermissions] = useState<
    String[]
  >([]);

  /**
   * @description get the user's granted permissions
   */
  const getUserGrantedPermissions = useCallback(async () => {
    try {
      const permissions = await grantedPermissions();
      setUserGrantedPermissions(permissions);
    } catch (err) {
      setUserGrantedPermissions([]);
    }
  }, []);

  const [lastExecutionDate, setLastExecutionDate] = useAsyncStorage<
    string | null
  >('lastExecutionDate', null);

  /**
   * @description get the past week of sleep and daily data based on an AsyncStorage flag
   * this makes sure that the daily data that we store is reasonably up to date, as data might not be called in the background if the user does not open the app
   */
  const getPastWeekAndSendToWebhook = useCallback(async () => {
    if (!terraDevice) return;

    const currentDate = dayjs();
    // If the function was executed less than three days ago, return
    if (
      lastExecutionDate &&
      currentDate.diff(dayjs(lastExecutionDate), 'days') < 3
    ) {
      return;
    }

    const endDate = dayjs().add(1, 'days').toISOString();
    const startDate = dayjs().subtract(15, 'days').toISOString();

    await getDaily(
      Connections.APPLE_HEALTH,
      dayjs(startDate).toDate(),
      dayjs(endDate).toDate(),
      true,
    );
    await getSleep(
      Connections.APPLE_HEALTH,
      dayjs(startDate).toDate(),
      dayjs(endDate).toDate(),
      true,
    );

    setLastExecutionDate(currentDate.toISOString());
  }, [lastExecutionDate, setLastExecutionDate, terraDevice]);

  /**
   * @description get and set historical data, should only be done once ever (this is the past six months)
   */
  const checkHistoricalData = useCallback(async () => {
    if (!terraDevice) return;
    const endDate = dayjs().subtract(1, 'days').toISOString();
    const startDateTesting = dayjs().subtract(2, 'days').toISOString();
    const startDateLong = dayjs().subtract(182, 'days').toISOString();

    // artificially wait 10 seconds before progressing
    await new Promise(resolve => setTimeout(resolve, 10000));

    try {
      const testResponse = await getDaily(
        Connections.APPLE_HEALTH,
        dayjs(startDateTesting).toDate(),
        dayjs(endDate).toDate(),
        true,
      );

      // if both sleep response and daily response are error + unauthenticated, return
      if (testResponse.error && testResponse.error === 'Unauthenticated') {
        console.log(
          'apple health unauthenticated, not fetching historical data at the moment',
        );
        return;
      }

      // update historical to be true, and then fetch the past 96 days
      await updateDevice(terraDevice.id, accessToken, true);
      await Promise.allSettled([
        getDaily(
          Connections.APPLE_HEALTH,
          dayjs(startDateLong).toDate(),
          dayjs(endDate).toDate(),
          true,
        ),
        getSleep(
          Connections.APPLE_HEALTH,
          dayjs(startDateLong).toDate(),
          dayjs(endDate).toDate(),
          true,
        ),
      ]);
    } catch (err) {
      console.log(err);
    }
  }, [accessToken, terraDevice]);

  /**
   * SET INITIAL CONTEXT
   */
  useEffect(() => {
    const init = async () => {
      if (!terraDevice) {
        return await getTerraDevice();
      }

      if (!initStatus) return; // if terra is not initialized, do not progress with reading from Terra

      // fetch the past week and send it to the backend
      await getPastWeekAndSendToWebhook();

      // if historical data has not been set, request past data and set it
      if (terraDevice.historicalData !== true) {
        await checkHistoricalData();
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initStatus, terraDevice]);

  return (
    <TerraContext.Provider
      value={{
        terraDeviceLoading,
        setTerraDeviceLoading,
        deleteDeviceLoading,
        setDeleteDeviceLoading,
        terraDevice,
        setTerraDevice,
        disconnectTerraDevice,
        connectTerraDevice,
        error,
        setError,
        getTerraDevice,
        // PERMISSIONS
        getUserGrantedPermissions,
        userGrantedPermissions,
      }}>
      {children}
    </TerraContext.Provider>
  );
};
