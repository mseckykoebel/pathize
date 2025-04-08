import {useState, useEffect} from 'react';
import notifee from '@notifee/react-native';

import {oneButtonAlert} from '../../lib';

export const useNotificationsStatus = () => {
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

  const requestPermission = async () => {
    const settings = await notifee.requestPermission();

    // if zero, show oneButtonAlert and set to false
    if (settings.authorizationStatus === 0) {
      oneButtonAlert(
        'Notifications Disabled',
        'Notifications are currently disabled for Pathize. You can enable notifications in your phone settings.',
      );
      setIsAuthorized(false);
    } else {
      setIsAuthorized(settings.authorizationStatus > 0); // in the case of -1
    }
  };

  // when component loads, get the current status
  useEffect(() => {
    const getNotificationSettings = async () => {
      const currentSettings = await notifee.getNotificationSettings();

      // if zero, show oneButtonAlert and set to false
      if (currentSettings.authorizationStatus === 0) {
        oneButtonAlert(
          'Notifications Disabled',
          'Notifications are currently disabled for Pathize. You can enable notifications in your phone settings.',
        );
        setIsAuthorized(false);
      } else {
        setIsAuthorized(currentSettings.authorizationStatus > 0); // in the case of -1
      }
    };

    getNotificationSettings();
  }, []);

  return {requestPermission, isAuthorized};
};
