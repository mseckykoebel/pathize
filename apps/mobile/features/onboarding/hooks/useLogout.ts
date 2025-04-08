import {useState, Dispatch} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Intercom from '@intercom/intercom-react-native';

import {fetcher} from '../../../utils';
import {DispatchPayload} from '../../../services';
import {useAuth} from '../../../CoreNav';

async function handleLogout(dispatcher: Dispatch<DispatchPayload>) {
  await Intercom.logout();
  await AsyncStorage.getAllKeys().then(keys => AsyncStorage.multiRemove(keys));
  dispatcher({type: 'SIGNED_OUT'});
}

export const useLogout = () => {
  const {userId, dispatch} = useAuth();
  const [loading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logOut = async () => {
    const responseBody = JSON.stringify({
      userId: userId,
    });

    try {
      await fetcher('api/v1/logout', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: responseBody,
      });
      return await handleLogout(dispatch);
    } catch (err) {
      console.log('logout error: ', err);
      setError('Something went wrong, please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  return {logOut, loading, error};
};
