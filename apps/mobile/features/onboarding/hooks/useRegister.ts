import {useCallback, useState} from 'react';
import {jwtDecode, JwtPayload} from 'jwt-decode';
import {decode as atob} from 'base-64';
import Purchases from 'react-native-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Intercom from '@intercom/intercom-react-native';
import dayjs from 'dayjs';

import {
  AuthResponse,
  LoginResponse,
  PatchResponse,
  RegisterResponse,
  TargetResponse,
} from '@pathize/api';
import {Notification, OnboardingInformation} from '@pathize/db';
import {AllScreenParams, useAnalytics} from '../../../hooks';
import {fetcher} from '../../../utils';

// https://github.com/auth0/jwt-decode/blob/main/CHANGELOG.md#change-log
global.atob = atob;

async function createNotification(
  userId: string,
  accessToken: string,
  kind: Notification['option'],
) {
  try {
    const requestBody = JSON.stringify({
      userId: userId,
      option: kind,
      time:
        kind === 'MORNING_REMINDER'
          ? dayjs().hour(8).minute(0).toDate()
          : kind === 'EVENING_REMINDER'
            ? dayjs().hour(19).minute(0).toDate()
            : null,
      enabled: true,
    });
    const create: PatchResponse<Notification> = await fetcher(
      'api/v1/createOrUpdateNotification',
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: requestBody,
      },
    );

    // this is allowed to silently fail, will continue to show the error message
    console.log(create);
  } catch (err) {
    console.log(err);
  }
}

async function createLimit(limit: number, userId: string, accessToken: string) {
  try {
    const createBaseline: TargetResponse = await fetcher(
      `api/v1/createTarget?userId=${userId}&target=${limit}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken!}`,
        },
      },
    );

    if (createBaseline.status === 500 || createBaseline.status === 404) {
      return;
    }
  } catch (e) {
    console.log(e);
  }
}

export const useRegister = (screenName: AllScreenParams) => {
  const {interfaceEvent, identify} = useAnalytics();
  const [loading, setLoading] = useState(false);

  const register = useCallback(
    async (
      user: OnboardingInformation,
      email: string,
      password: string,
      passwordConfirm: string,
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
      // chad regex
      const validRegex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
      if (!validRegex.test(email)) {
        return {
          success: false,
          message: 'Please enter a valid email.',
        };
      }
      if (password.length < 6) {
        return {
          success: false,
          message: 'Password must be at least 6 characters.',
        };
      }
      if (password !== passwordConfirm) {
        return {
          success: false,
          message: 'Passwords do not match.',
        };
      }

      setLoading(true);

      // 1️⃣ see if a user with this email exists already
      try {
        const body = JSON.stringify({
          email: email,
        });
        const validateNewUserResponse: AuthResponse<LoginResponse> =
          await fetcher('api/v1/validateNewUser', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: body,
          });

        if (validateNewUserResponse.status === 409) {
          setLoading(false);
          return {
            success: false,
            message: 'This email is already in use! Please try again.',
          };
        }

        if (validateNewUserResponse.status === 500) {
          console.log(validateNewUserResponse);
          setLoading(false);
          return {
            success: false,
            message: 'Something went wrong! Please try again.',
          };
        }
      } catch (err) {
        console.log(err);
        setLoading(false);
        return {
          success: false,
          message: 'Something went wrong! Please try again.',
        };
      }

      // 2️⃣ create the user=
      try {
        // try to make the user
        const requestBody = JSON.stringify({
          email: email,
          password: password,
          user: user,
        });

        const createUser: AuthResponse<RegisterResponse> = await fetcher(
          'createUser',
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: requestBody,
          },
        );

        if (createUser.status === 500) {
          setLoading(false);
          return {
            success: false,
            message: 'Something went wrong! Please try again.',
          };
        }

        const decodedAccessToken = jwtDecode<JwtPayload>(
          createUser.data?.accessToken!,
        );

        // check for JWT params
        if (
          !decodedAccessToken.sub ||
          !createUser.data?.accessToken ||
          !createUser.data?.refreshToken
        ) {
          setLoading(false);
          return {
            success: false,
            message: 'There was an issue on our end! Please try again.',
          };
        }

        const {created} = await Purchases.logIn(decodedAccessToken.sub);
        if (!created) {
          await fetcher(
            `api/v1/deleteAccount?userId=${decodedAccessToken.sub}`,
            {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${createUser.data?.accessToken}`,
              },
            },
          );
          return {
            success: false,
            message:
              "There was an issue registering you! This is an issue on our end, so if this persists, please reach out to us and we'll help you out.",
          };
        }

        // set the attributes in revenuecat
        Purchases.setAttributes({
          email: email,
          name: user.firstName,
          phoneNumber: user.phoneNumber,
          dateOfBirth: user.dateOfBirth,
        });

        // set tokens
        await AsyncStorage.setItem('userId', decodedAccessToken.sub);
        await AsyncStorage.setItem('accessToken', createUser.data.accessToken);
        await AsyncStorage.setItem(
          'refreshToken',
          createUser.data.refreshToken,
        );

        // set limit in backend
        const baseline = Math.trunc(
          (220 - dayjs().diff(dayjs(user.dateOfBirth), 'year')) * 0.55,
        );
        await createLimit(
          baseline,
          decodedAccessToken.sub,
          createUser.data.accessToken,
        );

        // create notifications
        await createNotification(
          decodedAccessToken.sub,
          createUser.data.accessToken,
          'MORNING_REMINDER',
        );
        await createNotification(
          decodedAccessToken.sub,
          createUser.data.accessToken,
          'EVENING_REMINDER',
        );
        await createNotification(
          decodedAccessToken.sub,
          createUser.data.accessToken,
          'ENERGY',
        );

        // identify in posthog
        identify(decodedAccessToken.sub);
        interfaceEvent('Registered', {
          $screen_name: screenName,
        });
        // log in a user with intercom
        Intercom.loginUserWithUserAttributes({
          email: email,
          userId: decodedAccessToken.sub,
        });

        setLoading(false);
        return {
          success: true,
          credentials: {
            userId: decodedAccessToken.sub,
            accessToken: createUser.data?.accessToken,
            refreshToken: createUser.data?.refreshToken,
          },
        };
      } catch (err) {
        setLoading(false);
        return {
          success: false,
          message: 'Something went wrong! Please try again.',
        };
      }
    },
    [identify, interfaceEvent, screenName],
  );

  return {register, loading};
};
