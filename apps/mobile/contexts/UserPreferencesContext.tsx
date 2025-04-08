import React, {
  ReactNode,
  useState,
  useEffect,
  useContext,
  SetStateAction,
  Dispatch,
  createContext,
  useCallback,
} from 'react';

import {GetResponse, PatchResponse} from '@pathize/api';
import {User, UserPreference} from '@pathize/db';
import {useAuth} from '../CoreNav';
import {fetcher} from '../utils';
import {createUserPreferences} from '../services/preferences/createUserPreferences';

export type UserPreferencesContext = {
  // helper functions
  fetchUserPreferences: () => Promise<void>;
  getTimezoneOffset: () => Promise<void>;
  updateTimezoneOffset: () => Promise<PatchResponse<User> | undefined>;
  updateTimezone: () => Promise<PatchResponse<User> | undefined>;
  // preferences
  userPreferences: UserPreference | null;
  setUserPreferences: Dispatch<SetStateAction<UserPreference | null>>;
};

const UserPreferencesContext = createContext<
  UserPreferencesContext | undefined
>(undefined);

export const useUserPreferencesContext = () => {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error(
      'useUserPreferencesContext must be used within a UserPreferencesProvider',
    );
  }
  return context;
};

export const UserPreferencesProvider = ({children}: {children: ReactNode}) => {
  const {userId, accessToken} = useAuth();
  const [userPreferences, setUserPreferences] = useState<UserPreference | null>(
    null,
  );

  /**
   * @description fetch user preferences
   */
  const fetchUserPreferences = useCallback(async () => {
    const preferences: GetResponse<UserPreference> = await fetcher(
      `api/v1/getUserPreferences?userId=${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    // if error status is 404, create one
    if (preferences.status === 404) {
      // create user preference
      const onCreate = await createUserPreferences(userId, accessToken);
      if (onCreate) {
        setUserPreferences(onCreate);
      }
      return;
    }
    // if still a status, return
    if (preferences.status !== 200) return;
    // set global user preferences
    setUserPreferences(preferences.data as UserPreference);
  }, [userId, accessToken]);

  /**
   * @description update user timezone offset
   */
  const updateTimezoneOffset = useCallback(async () => {
    // silently error if fails
    const timezoneOffset = new Date().getTimezoneOffset();
    return await fetcher(
      `api/v1/updateUserTimezoneOffset?userId=${userId}&timezoneOffset=${timezoneOffset}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
  }, [userId, accessToken]);

  /**
   * @description update user timezone
   */
  const updateTimezone = useCallback(async () => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return await fetcher(
      `api/v1/updateUserTimezone?userId=${userId}&timezone=${timezone}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
  }, [userId, accessToken]);

  /**
   * @description get just the user's timezone offset
   */
  const getTimezoneOffset = useCallback(async () => {
    try {
      const response: GetResponse<User> = await fetcher(
        `api/v1/getUser?userId=${userId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (response.status === 404 || response.status === 500) return;

      // if timezone offset not present
      if (!(response.data as User).timezoneOffset) {
        updateTimezoneOffset();
      }
      // if timezone not present
      if (!(response.data as User).timezone) {
        updateTimezone();
      }
    } catch (err) {
      console.log(err);
    }
  }, [userId, accessToken, updateTimezoneOffset, updateTimezone]);

  useEffect(() => {
    fetchUserPreferences();
    getTimezoneOffset();
  }, [fetchUserPreferences, getTimezoneOffset]);

  return (
    <UserPreferencesContext.Provider
      value={{
        // helper functions
        fetchUserPreferences,
        getTimezoneOffset,
        updateTimezoneOffset,
        updateTimezone,
        // preferences
        userPreferences,
        setUserPreferences,
      }}>
      {children}
    </UserPreferencesContext.Provider>
  );
};
