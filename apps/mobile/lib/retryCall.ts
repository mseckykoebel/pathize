import {refreshAccessToken} from './refreshAccessToken';

export const retryCall = async (
  fn: () => Promise<any>,
  logout: (userId: string) => Promise<any>,
  userId: string,
) => {
  try {
    const refreshAccessTokenResult = await refreshAccessToken(userId as string);
    if (!refreshAccessTokenResult) {
      logout(userId);
    } else {
      fn();
    }
  } catch (e) {
    logout(userId);
  }
};
