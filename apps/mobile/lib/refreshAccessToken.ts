import {AccessToken, Error} from '@pathize/db';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {fetcher} from '../utils/fetcher';

export const refreshAccessToken = async (userId: string) => {
  const refreshToken = await AsyncStorage.getItem('refreshToken');
  if (!refreshToken) {
    console.log('No refresh token found. Please log in again.');
    return false;
  }
  try {
    const responseBody = JSON.stringify({
      userId: userId,
      refreshToken: refreshToken,
    });
    // send the response
    const response: AccessToken | Error | undefined = await fetcher('token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: responseBody,
    });
    // if this is anything but an access token or a 404, there was an issue with the request
    if (!response) {
      console.log(
        'There was a problem on our end! Please close the app and re-open to try again.',
      );
      return false;
    }
    // if there was a 404, then the email is incorrect
    if ((response as Error).status === 404) {
      console.log('No user found...');
      return false;
    }
    // if there was a 401, then there was no refresh token
    if ((response as Error).status === 401) {
      console.log('No refresh token provided...');
      return false;
    }
    // if there was a 403, then this refresh token was not found in the database
    if ((response as Error).status === 403) {
      console.log('No refresh token found...');
      return false;
    }
    // set the access token
    await AsyncStorage.setItem(
      'accessToken',
      (response as AccessToken).accessToken,
    );

    return refreshToken;
  } catch (e) {
    console.log(e);
    return false;
  }
};
