import React, {
  ReactNode,
  useState,
  useContext,
  SetStateAction,
  Dispatch,
  createContext,
  useCallback,
  useEffect,
} from 'react';
import {CustomerIO} from 'customerio-reactnative';
import messaging from '@react-native-firebase/messaging';

import {GetResponse} from '@pathize/api';
import {User} from '@pathize/db';
import {useAuth} from '../CoreNav';
import {fetcher} from '../utils';
import {useLogout} from '../hooks';

async function setupCioAndIdentifyUser(userId: string, email: string) {
  CustomerIO.identify(userId, {
    email: email,
  });
  const token = await messaging().getAPNSToken();
  if (!token) return;
  CustomerIO.registerDeviceToken(token);
}

export type UserContext = {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  getUser: () => Promise<void>;
  updateUserEmail: (id: string, email: string) => Promise<void>;
  updateUserFirstName: (id: string, firstName: string) => Promise<void>;
  deleteUser: () => Promise<void>;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  error: string | null;
  setError: Dispatch<SetStateAction<string | null>>;
  // get user loading and error
  getUserLoading: boolean;
  setGetUserLoading: Dispatch<SetStateAction<boolean>>;
  getUserError: string | null;
  setGetUserError: Dispatch<SetStateAction<string | null>>;
  // delete account loading and error
  deleteAccountLoading: boolean;
  setDeleteAccountLoading: Dispatch<SetStateAction<boolean>>;
  deleteAccountError: string | null;
  setDeleteAccountError: Dispatch<SetStateAction<string | null>>;
  deleteAccount: () => Promise<void>;
};

const UserContext = createContext<UserContext | undefined>(undefined);

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({children}: {children: ReactNode}) => {
  const {userId, accessToken} = useAuth();
  const {logOut} = useLogout();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [getUserLoading, setGetUserLoading] = useState<boolean>(false);
  const [getUserError, setGetUserError] = useState<string | null>(null);

  /**
   * @description fetch user
   */
  const getUser = useCallback(async () => {
    setGetUserLoading(true);
    try {
      const response: GetResponse<User> = await fetcher(
        `api/v1/getUser?userId=${userId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (response.status === 404 || Array.isArray(response.data)) {
        setGetUserError(
          'Unable to locate your account! Please try again in a few minutes.',
        );
      } else {
        // set user, and identify the user within customerIO
        setUser(response.data!);
        return await setupCioAndIdentifyUser(userId, response.data!.email);
      }
    } catch (err) {
      setGetUserError(
        'There was an error on our end! Please try again in a few minutes.',
      );
    } finally {
      setGetUserLoading(false);
      setTimeout(() => setGetUserError(null), 3000);
    }
  }, [userId, accessToken]);

  /**
   * @description update user first name
   */

  const updateUserFirstName = useCallback(
    async (id: string, firstName: string) => {
      const body = JSON.stringify({
        userId: id,
        firstName: firstName,
      });
      setLoading(true);
      try {
        const response: User = await fetcher(
          `api/v1/updateUser?userId=${userId}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: body,
          },
        );
        // TODO: shitty, this is a 404
        if ((response as any).message) {
          setError(
            'Unable to locate your account! This is probably an error. Please try again in a few minutes.',
          );
        } else {
          setUser(response);
        }
      } catch (err) {
        setError(
          'There was an error on our end! Please try again in a few minutes.',
        );
      } finally {
        setLoading(false);
        setError(null);
      }
    },
    [accessToken, userId],
  );

  /**
   * @description update user email
   */
  const updateUserEmail = useCallback(
    async (id: string, email: string) => {
      const validRegex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
      if (!validRegex.test(email)) {
        setError('Please enter a valid email address.');
        setTimeout(() => setError(null), 3000);
        return;
      }
      const body = JSON.stringify({
        userId: id,
        email: email,
      });

      setLoading(true);
      try {
        // first, see if this email is in use already
        const users: User[] | undefined = await fetcher('api/v1/getAllUsers', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (users?.find(o => o.email === email.toLowerCase() && o.id === id)) {
          setError('This email is already in use.');
        } else {
          const response: User = await fetcher(
            `api/v1/updateUser?userId=${userId}`,
            {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
              },
              body: body,
            },
          );

          // TODO: shitty, this is a 404
          if ((response as any).message) {
            setError(
              'Unable to locate your account! This is probably an error. Please try again in a few minutes.',
            );
          } else {
            setUser(response);
          }
        }
      } catch (err) {
        setError(
          'There was an error on our end! Please try again in a few minutes.',
        );
      } finally {
        setLoading(false);
        setError(null);
      }
    },
    [accessToken, userId],
  );
  /**
   * @description delete user
   */
  const deleteUser = useCallback(async () => {
    setLoading(true);
    try {
      await fetcher(`api/v1/deleteUser?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (err) {
      setError(
        'There was an error on our end! Please try again in a few minutes.',
      );
    } finally {
      setLoading(false);
      setTimeout(() => setError(null), 3000);
    }
  }, [accessToken, userId]);

  const [deleteAccountLoading, setDeleteAccountLoading] =
    useState<boolean>(false);
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(
    null,
  );

  /**
   * @description delete a user's entire account
   */
  const deleteAccount = async () => {
    setDeleteAccountLoading(true);
    try {
      const request = await fetcher(`api/v1/deleteAccount?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (request.message) {
        setDeleteAccountError(
          'There was an error deleting your account. Please try again in a few minutes.',
        );
      } else {
        await logOut();
      }
    } catch (e) {
      setDeleteAccountError(
        'There was an error deleting your account. Please try again in a few minutes.',
      );
    } finally {
      setDeleteAccountLoading(false);
      setTimeout(() => setDeleteAccountError(null), 50);
    }
  };

  useEffect(() => {
    if (!user) getUser();
  }, [user, getUser]);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        getUser,
        updateUserEmail,
        updateUserFirstName,
        deleteUser,
        loading,
        setLoading,
        error,
        setError,
        // get user loading and error
        getUserLoading,
        setGetUserLoading,
        getUserError,
        setGetUserError,
        // delete account
        deleteAccountLoading,
        setDeleteAccountLoading,
        deleteAccountError,
        setDeleteAccountError,
        deleteAccount,
      }}>
      {children}
    </UserContext.Provider>
  );
};
