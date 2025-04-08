import React, {
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useCallback,
} from 'react';

import {useAuth} from '../CoreNav';
import {fetcher} from '../utils';
import {UserTarget} from '@pathize/db';
import {TargetResponse} from '@pathize/api';

export type LimitContext = {
  loading: boolean;
  error: string;
  limit: number | null;
  setLimit: Dispatch<SetStateAction<number | null>>;
  limitRecord: UserTarget | null;
  setLimitRecord: Dispatch<SetStateAction<UserTarget | null>>;
  // LOADING AND ERROR FOR UPDATING LIMIT
  updateLimitLoading: boolean;
  setUpdateLimitLoading: Dispatch<SetStateAction<boolean>>;
  updateLimitError: string | null;
  setUpdateLimitError: Dispatch<SetStateAction<string | null>>;
  // HELPER FUNCTIONS
  getLimit: () => Promise<void>;
  createLimit: (limit: number) => Promise<void>;
  updateLimit: (id: string, selectedLimit: number) => Promise<void>;
};

const LimitContext = createContext<LimitContext | undefined>(undefined);

export const useLimitContext = () => {
  const context = useContext(LimitContext);
  if (context === undefined) {
    throw new Error('useLimitContext must be used within a LimitProvider');
  }
  return context;
};

export const LimitProvider = ({children}: {children: ReactNode}) => {
  const {userId, accessToken} = useAuth();
  const [limit, setLimit] = useState<number | null>(null);
  const [limitRecord, setLimitRecord] = useState<UserTarget | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [updateLimitLoading, setUpdateLimitLoading] = useState<boolean>(false);
  const [updateLimitError, setUpdateLimitError] = useState<string | null>(null);

  /**
   * @description fetches and sets the users' limit
   */
  const getLimit = useCallback(async () => {
    setLoading(true);
    try {
      const targets: UserTarget[] = await fetcher(
        `api/v1/getTargets?userId=${userId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      console.log('targets: ', targets);
      if (!targets || targets.length === 0) return;
      setLimit(Number(targets[0].target));
      setLimitRecord(targets[0]);
    } catch (e) {
      setError('There was an issue fetching your limit. Please try again.');
      setTimeout(() => {
        setError('');
      }, 3000);
    }

    setLoading(false);
  }, [userId, accessToken]);

  /**
   * @description creates a new limit for the user
   */
  const createLimit = async (selectedLimit: number) => {
    setLoading(true);
    try {
      const createBaseline: TargetResponse = await fetcher(
        `api/v1/createTarget?userId=${userId}&target=${selectedLimit}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken!}`,
          },
        },
      );

      if (createBaseline.status === 500 || createBaseline.status === 404) {
        setError('There was an issue creating your limit. Please try again.');
        setTimeout(() => {
          setError('');
        }, 3000);
        return;
      }
      setLimit(selectedLimit);
    } catch (e) {
      setError('There was an issue creating your limit. Please try again.');
      setTimeout(() => {
        setError('');
      }, 3000);
    }
  };

  /**
   * @description updates the users' limit
   * @note this function kind of blows, idk why finally
   */
  const updateLimit = async (id: string, selectedLimit: number) => {
    // validate limit
    const numOnly = new RegExp('^[0-9]+$');
    const betweenThirtyAndTwoTen = selectedLimit >= 30 && selectedLimit <= 210;
    if (!numOnly.test(String(selectedLimit)) || !betweenThirtyAndTwoTen) {
      setUpdateLimitError('Please enter a valid number between 30 and 210.');
      setUpdateLimitLoading(false);
      setTimeout(() => setUpdateLimitError(null), 500);
      return;
    }

    setUpdateLimitLoading(true);
    try {
      const response: UserTarget = await fetcher(
        `api/v1/updateTarget?targetId=${id}&target=${selectedLimit}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      //TODO: carryover from old API, this sucks, type API better
      if ((response as any).status) {
        setError('There was an issue updating your limit. Please try again.');
      } else {
        setLimitRecord(response);
        setLimit(selectedLimit);
      }
    } catch (e) {
      setError('There was an issue updating your limit. Please try again.');
    } finally {
      setUpdateLimitLoading(false);
      setTimeout(() => setUpdateLimitError(null), 500);
    }
  };

  // get limit on initialization
  useEffect(() => {
    getLimit();
  }, [getLimit]);

  return (
    <LimitContext.Provider
      value={{
        loading,
        error,
        limit,
        setLimit,
        limitRecord,
        setLimitRecord,
        getLimit,
        createLimit,
        updateLimit,
        updateLimitLoading,
        setUpdateLimitLoading,
        updateLimitError,
        setUpdateLimitError,
      }}>
      {children}
    </LimitContext.Provider>
  );
};
