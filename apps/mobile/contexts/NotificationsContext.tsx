import React, {
  useState,
  createContext,
  useContext,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
  useCallback,
} from 'react';
import messaging from '@react-native-firebase/messaging';
import notifee, {EventType, Notification} from '@notifee/react-native';

import {FcmToken} from '@pathize/db';
import {useAuth} from '../CoreNav';
import {useAnalytics} from '../hooks';
import {
  createFcmToken,
  getFcmTokens,
  logError,
  updateFcmToken,
} from '../services';

export type NotificationsContext = {
  fcmToken: string | null;
  setFcmToken: Dispatch<SetStateAction<string | null>>;
};

const NotificationsContext = createContext<NotificationsContext | undefined>(
  undefined,
);

export const useNotificationsContext = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      'useNotificationsContext must be used within a NotificationsProvider',
    );
  }

  return context;
};

export const NotificationsProvider = ({children}: {children: ReactNode}) => {
  const {userId, accessToken} = useAuth();
  const {interactionEvent} = useAnalytics();

  const [fcmToken, setFcmToken] = useState<string | null>(null);

  /**
   * @description toggles asking for notification permission
   */

  const handleNotificationPress = useCallback(
    async (notification: Notification | undefined) => {
      if (!notification) return;

      interactionEvent('Notification', 'Pressed', {
        $screen_name: 'Home',
        value: notification.title + ' - ' + notification.body,
      });

      // DEPRECATED until we can set day correctly
      /**
      if (notification.data?.type === 'CHECK_IN') {
        const checkInId = notification.data?.checkInId as string;
        if (!checkInId) {
          oneButtonAlert(
            'Issue loading check-in',
            'We ran into an issue loading your check-in - check-in not found.',
          );
          return;
        }

        // get the check-in itself
        let checkIn: CheckInComplete | undefined;
        try {
          const response = await getCheckIn(checkInId, accessToken);
          if (!response.success) {
            oneButtonAlert(
              'Issue loading check-in',
              'We ran into an issue loading your check-in - check-in not found.',
            );
            return;
          }

          checkIn = response.data as CheckInComplete;
        } catch (err) {
          oneButtonAlert(
            'Issue loading check-in',
            'We ran into an issue loading your check-in.',
          );
          return;
        }

        // set the date to be actuallyToday
        setSelectedId('0');
        setToday(actuallyToday);

        // load medications, supplements, and navigate
        try {
          const medicationIds = checkIn.medications.map(
            m => m.userMedicationId,
          );
          const symptomIds = checkIn.symptoms.map(s => s.userSymptomId);

          const medicationsFromDb = await getUserMedicationsById(
            medicationIds,
            accessToken,
          );
          const symptomsFromDb = await getUserSymptomsById(
            symptomIds,
            accessToken,
          );

          // if either one failed, show error and return
          if (!medicationsFromDb.success || !symptomsFromDb.success) {
            oneButtonAlert(
              'Issue loading check-in',
              'We ran into an issue loading your check-in.',
            );
            return;
          }

          const params = {
            checkIn: checkIn,
            medications: medicationsFromDb.data as UserMedication[],
            symptoms: symptomsFromDb.data as UserSymptom[],
          };

          // finally, we can navigate with all the information that we have
          homeNavigation.navigate('RecordCheckIn', params);
        } catch (err) {
          oneButtonAlert(
            'Issue loading check-in',
            'We ran into an issue loading your check-in.',
          );
        }
      }
       */
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /**
   * @description create or update FCM token onInit
   * this makes sure the server FCM token and the one on-device are in parity
   */
  useEffect(() => {
    const upsertFcmToken = async () => {
      try {
        const isRegistered = messaging().isDeviceRegisteredForRemoteMessages;

        if (!isRegistered) {
          return await messaging().registerDeviceForRemoteMessages();
        }

        const token = await messaging().getToken();
        const tokensFromDb = await getFcmTokens(userId, accessToken);
        console.log('tokensFromDb: ', tokensFromDb);
        if (!tokensFromDb.success) {
          await logError(
            userId,
            accessToken,
            'Issue getting FCM tokens from DB!',
          );
        }

        const tokenExists = (tokensFromDb.data as FcmToken[]).find(
          t => t.token === token,
        );
        if (tokenExists) {
          // update it with this new token (can ignore result of this)
          await logError(userId, accessToken, 'UPDATING TOKEN!!!');
          await updateFcmToken(accessToken, tokenExists.id, token);
        } else {
          // create it (can  ignore result of this)
          await logError(userId, accessToken, 'CREATING TOKEN!!!');
          await createFcmToken(userId, accessToken, token);
        }

        setFcmToken(token);
      } catch (err) {
        await logError(userId, accessToken, String(err));
      }
    };

    upsertFcmToken();
  }, [userId, accessToken]);

  // this handles incoming messages
  useEffect(() => {
    return notifee.onForegroundEvent(({type, detail}) => {
      switch (type) {
        case EventType.DISMISSED:
          console.log('User dismissed notification', detail.notification);
          break;
        case EventType.PRESS:
          handleNotificationPress(detail.notification);
          break;
      }
    });
  }, [handleNotificationPress]);

  const value = {
    fcmToken,
    setFcmToken,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};
