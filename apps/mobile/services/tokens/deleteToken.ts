import messaging from '@react-native-firebase/messaging';
import {fetcher} from '../../utils/fetcher';

const deleteToken = async (userId: string, accessToken: string) => {
  try {
    // if the user is not authorized to get messages, return
    if (!messaging().isDeviceRegisteredForRemoteMessages) return null;
    // get the token
    const token = await messaging().getToken();
    const body = JSON.stringify({
      userId: userId,
      token: token,
    });
    const response = await fetcher('api/v1/deleteFcmToken', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body,
    });
    // if response contains a message, return null
    if (response.message) return null;
    return 'Success';
  } catch (err) {
    return null;
  }
};

export default deleteToken;
