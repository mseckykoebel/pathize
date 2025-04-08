import {Platform} from 'react-native';
import {config} from '../config';

const platform = (): 'ios' | 'android' => {
  if (Platform.OS === 'ios') return 'ios';
  if (Platform.OS === 'android') return 'android';

  throw new Error('Platform not supported');
};

const HOST = config.api.host;
export const BASE_URL =
  config.api.environment === 'development' && platform() === 'android'
    ? 'http://10.0.2.2:3000'
    : HOST;

export const fetcher = async (
  url: string,
  options?: Record<string, unknown>,
) => {
  try {
    const res = await fetch(`${BASE_URL}/${url}`, options);
    if (res.status === 204) return {};

    const text = await res.text();
    return text ? JSON.parse(text) : {};
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
};

export const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  return String(error);
};
