import {useState, useEffect, useCallback} from 'react';
import dayjs from 'dayjs';

import {Notification, UserPreference} from '@pathize/db';
import {GetResponse, PatchResponse} from '@pathize/api';
import {fetcher} from '../../utils';
import {useAuth} from '../../CoreNav';

////
// GET AND SAVE USER PREFERENCES FOR NOTIFICATIONS
////

export const useNotifications = () => {
  const {userId, accessToken} = useAuth();
  const [morningReminder, setMorningReminder] = useState<Notification | null>(
    null,
  );
  const [eveningReminder, setEveningReminder] = useState<Notification | null>(
    null,
  );
  const [energyNotification, setEnergyNotification] =
    useState<Notification | null>(null);
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  /**
   * CREATE a preference if it was not found
   */
  const createNotification = async (kind: Notification['option']) => {
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
  };

  /**
   * UPDATE a specific preference
   */
  const updateNotification = useCallback(
    async (
      id: string | null,
      value: number | null,
      time: Date | null,
      enabled: boolean,
      option: Notification['option'],
    ) => {
      const requestBody = JSON.stringify({
        id: id,
        userId: userId,
        value: value,
        time: time,
        enabled: enabled,
        option: option,
      });

      setLoading(true);
      try {
        const update: PatchResponse<Notification> = await fetcher(
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

        if (update.status === 200 && update.data) {
          if (option === 'MORNING_REMINDER') {
            setMorningReminder(update.data);
          } else if (option === 'EVENING_REMINDER') {
            setEveningReminder(update.data);
          } else if (option === 'ENERGY') {
            setEnergyNotification(update.data);
          }
          setLoading(false);
          setError(false);
          return {success: true};
        }

        // issue updating preferences
        setError(true);
      } catch (err) {
        console.log(err);
        setError(true);
      }

      setLoading(false);
      return {success: false};
    },
    [userId, accessToken],
  );

  /**
   * GET the initial list of preferences and set them
   */
  useEffect(() => {
    if (!userId || !accessToken) return;
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const reminderNotifications: GetResponse<Notification> = await fetcher(
          `api/v1/getNotifications?userId=${userId}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        if (
          reminderNotifications.status === 200 &&
          Array.isArray(reminderNotifications.data)
        ) {
          const mr = reminderNotifications.data.find(
            n => n.option === 'MORNING_REMINDER',
          );
          const er = reminderNotifications.data.find(
            n => n.option === 'EVENING_REMINDER',
          );
          const en = reminderNotifications.data.find(
            n => n.option === 'ENERGY',
          );

          if (mr) {
            setMorningReminder(mr);
          } else {
            createNotification('MORNING_REMINDER');
          }

          if (er) {
            setEveningReminder(er);
          } else {
            createNotification('EVENING_REMINDER');
          }

          if (en) {
            setEnergyNotification(en);
          } else {
            createNotification('ENERGY');
          }

          setLoading(false);
          setError(false);
          return;
        }

        setMorningReminder(null);
        setEveningReminder(null);
        setEnergyNotification(null);
        setError(true);
      } catch (err) {
        console.log(error);
        setMorningReminder(null);
        setEveningReminder(null);
        setEnergyNotification(null);
        setError(true);
      }

      setLoading(false);
    };

    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, accessToken]);

  return {
    morningReminder,
    eveningReminder,
    energyNotification,
    updateNotification,
    createNotification,
    loading,
    error,
  };
};

////
// GET AND SAVE USER PREFERENCE FOR NOTIFICATIONS
////

export const useNotificationPreferences = () => {
  const {userId, accessToken} = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState<
    boolean | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<boolean>(false);

  // save preferences - take in the toggle state
  // if it failed to save, switch the toggle back and show an error

  const updateNotificationPreferences = useCallback(
    async (enabled: boolean) => {
      setLoading(true);
      try {
        const update: PatchResponse<UserPreference> = await fetcher(
          `api/v1/updateUserPreferences?userId=${userId}&notificationsEnabled=${enabled}`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        if (update.status === 200 && update.data) {
          setNotificationsEnabled(update.data.notificationsEnabled);
          setLoading(false);
          setError(false);
          return {success: true};
        }

        // issue updating preferences
        setError(true);
      } catch (err) {
        console.log(err);
        setError(true);
      }

      setLoading(false);
      return {success: false};
    },
    [userId, accessToken],
  );

  useEffect(() => {
    if (!userId || !accessToken) return;
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const notificationPreferences: GetResponse<UserPreference> =
          await fetcher(`api/v1/getUserPreferences?userId=${userId}`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

        if (notificationPreferences.status === 200) {
          setNotificationsEnabled(
            (notificationPreferences.data as UserPreference)
              .notificationsEnabled,
          );
          setError(false);
        } else {
          console.log('error here...');
          setError(true);
        }
      } catch (err) {
        console.log(err);
        setError(true);
      }

      setLoading(false);
    };

    fetchNotifications();
  }, [userId, accessToken]);

  return {
    notificationsEnabled,
    setNotificationsEnabled,
    updateNotificationPreferences,
    loading,
    error,
  };
};
