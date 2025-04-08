import {useCallback, useState} from 'react';
import {jwtDecode, JwtPayload} from 'jwt-decode';
import {decode as atob} from 'base-64';
import Purchases from 'react-native-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Intercom from '@intercom/intercom-react-native';

import {AuthResponse, LoginResponse} from '@pathize/api';
import {
  AllScreenParams,
  useAnalytics,
  useAuthorizeConnectedDevice,
} from '../../../hooks';
import {fetcher} from '../../../utils';

// https://github.com/auth0/jwt-decode/blob/main/CHANGELOG.md#change-log
global.atob = atob;

export const useLogin = (screenName: AllScreenParams) => {
  const {interfaceEvent, identify} = useAnalytics();
  const {authorizeConnectedDevice} = useAuthorizeConnectedDevice();
  const [loading, setLoading] = useState(false);

  const login = useCallback(
    async (
      email: string,
      password: string,
    ): Promise<
      | {
          success: true;
          credentials: {
            userId: string;
            accessToken: string;
            refreshToken: string;
          };
        }
      | {success: false; message: string}
    > => {
      const responseBody = JSON.stringify({
        email: email,
        password: password,
      });

      setLoading(true);
      try {
        const response: AuthResponse<LoginResponse> = await fetcher('login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: responseBody,
        });

        if (response.status === 404) {
          setLoading(false);
          return {
            success: false,
            message: 'Your email is incorrect! Please try again.',
          };
        }

        if (response.status === 401) {
          setLoading(false);
          return {
            success: false,
            message: 'Your password is incorrect! Please try again.',
          };
        }
        const decodedAccessToken = jwtDecode<JwtPayload>(
          response.data?.accessToken as string,
        );

        // check for JWT params
        if (
          !decodedAccessToken.sub ||
          !response.data?.accessToken ||
          !response.data?.refreshToken
        ) {
          return {
            success: false,
            message: 'There was an issue on our end! Please try again.',
          };
        }

        // identify this user in revenuecat, and set email attribute
        const {created} = await Purchases.logIn(decodedAccessToken.sub);
        Purchases.setAttributes({
          email: email,
        });
        if (!created) {
          console.log('error creating user in revenuecat');
        }

        // set async storage "state"
        await AsyncStorage.setItem('userId', decodedAccessToken.sub);
        await AsyncStorage.setItem('accessToken', response.data?.accessToken);
        await AsyncStorage.setItem('refreshToken', response.data?.refreshToken);

        identify(decodedAccessToken.sub as string);
        interfaceEvent('Logged in', {
          $screen_name: screenName,
        });
        // log in a user with intercom
        Intercom.loginUserWithUserAttributes({
          email: email,
          userId: decodedAccessToken.sub,
        });

        await authorizeConnectedDevice(
          decodedAccessToken.sub,
          response.data?.accessToken,
        );

        setLoading(false);
        return {
          success: true,
          credentials: {
            userId: decodedAccessToken.sub,
            accessToken: response.data?.accessToken,
            refreshToken: response.data?.refreshToken,
          },
        };
      } catch (err) {
        setLoading(false);
        return {
          success: false,
          message: 'There was an issue on our end! Please try again.',
        };
      }
    },
    [authorizeConnectedDevice, identify, interfaceEvent, screenName],
  );

  return {login, loading};
};
