import AsyncStorage from '@react-native-async-storage/async-storage';
import {jwtDecode, JwtPayload} from 'jwt-decode';
import {decode as atob} from 'base-64';

import {getErrorMessage} from '../utils';

// https://github.com/auth0/jwt-decode/blob/main/CHANGELOG.md#change-log
global.atob = atob;

const setAccessAndRefreshTokens = async (
  accessToken: string,
  refreshToken: string,
) => {
  try {
    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
  } catch (e) {
    const error = getErrorMessage(e);
    console.log(error);
  }
};

const decodeAccessToken = (token: string) => {
  if (!token) {
    return null;
  }
  const accessToken = jwtDecode<JwtPayload>(token);
  return accessToken;
};

const isAccessTokenExpired = (token: string) => {
  if (!token) {
    return false;
  }
  const accessToken = jwtDecode<JwtPayload>(token);
  const now = Math.floor(Date.now() / 1000);
  if (!accessToken.exp) {
    return false;
  } // default to false if no expiration date (although this could be typed better)
  if (accessToken.exp < now) {
    return true;
  }
  return false;
};

export {setAccessAndRefreshTokens, isAccessTokenExpired, decodeAccessToken};
