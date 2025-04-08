import React, {
  ReactNode,
  createContext,
  useState,
  useContext,
  SetStateAction,
  Dispatch,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import dayjs from 'dayjs';

import {Crash} from '@pathize/db';
import {GetResponse} from '@pathize/api';
import {
  getAllCrashes as getAllCrashesFromDb,
  getCrashes as getCrashesFromDb,
} from '../services/crashes';
import {fetcher} from '../utils';
import {useAuth} from '../CoreNav';
import {useTodayDataContext} from './';
import {useAnalytics} from '../hooks';

////
// CONTEXT
////

export type CrashesContext = {
  // getting crashes
  getCrashes: () => Promise<void>;
  crashes: Crash[] | null;
  setCrashes: Dispatch<SetStateAction<Crash[] | null>>;
  getCrashesLoading: boolean;
  setGetCrashesLoading: Dispatch<SetStateAction<boolean>>;
  getCrashesError: string | null;
  setGetCrashesError: Dispatch<SetStateAction<string | null>>;
  // all crashes
  getAllCrashes: () => Promise<void>;
  allCrashes: Crash[] | null;
  setAllCrashes: Dispatch<SetStateAction<Crash[] | null>>;
  getAllCrashesLoading: boolean;
  setGetAllCrashesLoading: Dispatch<SetStateAction<boolean>>;
  getAllCrashesError: string | null;
  setGetAllCrashesError: Dispatch<SetStateAction<string | null>>;
  // crash sheet
  showCrashSheet: boolean;
  setShowCrashSheet: Dispatch<SetStateAction<boolean>>;
  // crash being edited
  crashBeingEdited: Crash | null;
  setCrashBeingEdited: Dispatch<SetStateAction<Crash | null>>;
  // create crash record
  createCrashRecord: (
    crashTotalTime: number,
    severity: number | null,
    time: Date,
    createdDay: string,
    notes: string,
  ) => Promise<void>;
  createCrashLoading: boolean;
  setCreateCrashLoading: Dispatch<SetStateAction<boolean>>;
  createCrashError: string | null;
  setCreateCrashError: Dispatch<SetStateAction<string | null>>;
  // update crash record
  updateCrashRecord: (
    id: string,
    crashTotalTime: number,
    severity: number | null,
    time: Date,
    notes: string,
  ) => Promise<void>;
  updateCrashLoading: boolean;
  setUpdateCrashLoading: Dispatch<SetStateAction<boolean>>;
  updateCrashError: string | null;
  setUpdateCrashError: Dispatch<SetStateAction<string | null>>;
  // delete crash record
  deleteCrashRecord: (crashRecordId: string) => Promise<void>;
  deleteCrashLoading: boolean;
  setDeleteCrashLoading: Dispatch<SetStateAction<boolean>>;
  deleteCrashError: string | null;
  setDeleteCrashError: Dispatch<SetStateAction<string | null>>;
  // historical time above limit
  historicalTimeAboveLimit: number | null;
  setHistoricalTimeAboveLimit: Dispatch<SetStateAction<number | null>>;
};

const CrashesContext = createContext<CrashesContext | undefined>(undefined);

export const useCrashesContext = () => {
  const context = useContext(CrashesContext);
  if (context === undefined) {
    throw new Error('useCrashesContext must be used within a CrashesProvider');
  }

  return context;
};

export const CrashesProvider = ({children}: {children: ReactNode}) => {
  const {accessToken, userId} = useAuth();
  const {recordEvent} = useAnalytics();
  const {today} = useTodayDataContext();
  const [crashBeingEdited, setCrashBeingEdited] = useState<Crash | null>(null);
  const [showCrashSheet, setShowCrashSheet] = useState(false);

  const [crashes, setCrashes] = useState<Crash[] | null>(null);
  const [getCrashesLoading, setGetCrashesLoading] = useState(false);
  const [getCrashesError, setGetCrashesError] = useState<string | null>(null);

  /**
   * @description gets all of the crash records for a given day
   */
  const getCrashes = useCallback(async () => {
    setGetCrashesLoading(true);
    try {
      const response = await getCrashesFromDb(userId, accessToken, today);
      if (!response.success) {
        setCrashes(null);
      }

      setCrashes(response.data as Crash[]);
    } catch (err) {
      setGetCrashesError(
        'Something went wrong getting your crashes!. Please try again in a few minutes.',
      );
    } finally {
      setGetCrashesLoading(false);
      setTimeout(() => setGetCrashesError(null), 50);
    }
  }, [today, userId, accessToken]);

  const [allCrashes, setAllCrashes] = useState<Crash[] | null>(null);
  const [getAllCrashesLoading, setGetAllCrashesLoading] = useState(false);
  const [getAllCrashesError, setGetAllCrashesError] = useState<string | null>(
    null,
  );

  /**
   * @description gets all of the crash records
   */
  const getAllCrashes = useCallback(async () => {
    setGetAllCrashesLoading(true);
    try {
      const response = await getAllCrashesFromDb(userId, accessToken);
      if (!response.success) {
        setAllCrashes(null);
      }

      setAllCrashes(response.data as Crash[]);
    } catch (err) {
      setGetAllCrashesError(
        'Something went wrong getting your crashes!. Please try again in a few minutes.',
      );
    } finally {
      setGetAllCrashesLoading(false);
      setTimeout(() => setGetAllCrashesError(null), 50);
    }
  }, [accessToken, userId]);

  const [historicalTimeAboveLimit, setHistoricalTimeAboveLimit] = useState<
    number | null
  >(null);

  const [createCrashLoading, setCreateCrashLoading] = useState(false);
  const [createCrashError, setCreateCrashError] = useState<string | null>(null);

  /**
   * @description creates a crash record
   */
  const createCrashRecord = useCallback(
    async (
      crashTotalTime: number,
      severity: number | null,
      time: Date,
      createdDay: string,
      notes: string,
    ) => {
      const responseBody = JSON.stringify({
        userId: userId,
        crashTotalTime: crashTotalTime,
        severity: severity,
        time: time,
        createdDay: createdDay,
        notes: notes,
      });

      setCreateCrashLoading(true);
      try {
        await fetcher('api/v1/createCrash', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: responseBody,
        });
        recordEvent('Crash/PEM', 'Created', {
          $screen_name: 'NewCrashRecord',
        });

        await getCrashes();
        await getAllCrashes();
      } catch (err) {
        setCreateCrashError(
          'Something went wrong creating your crash record!. Please try again in a few minutes.',
        );
      } finally {
        setCreateCrashLoading(false);
        setTimeout(() => setCreateCrashError(null), 50);
      }
    },
    [accessToken, getCrashes, recordEvent, userId, getAllCrashes],
  );

  const [updateCrashLoading, setUpdateCrashLoading] = useState(false);
  const [updateCrashError, setUpdateCrashError] = useState<string | null>(null);

  /**
   * @description update a single crash record
   */
  const updateCrashRecord = useCallback(
    async (
      id: string,
      crashTotalTime: number,
      severity: number | null,
      time: Date,
      notes: string,
    ) => {
      const responseBody = JSON.stringify({
        id: id,
        time: time,
        notes: notes,
        severity: severity,
        crashTotalTime: crashTotalTime,
      });

      setUpdateCrashLoading(true);

      try {
        await fetcher('api/v1/updateCrash', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: responseBody,
        });
        recordEvent('Crash/PEM', 'Updated', {
          $screen_name: 'EditCrashRecord',
        });

        await getCrashes();
      } catch (err) {
        setUpdateCrashError(
          'Something went wrong updating this crash, please try again in a few minutes.',
        );
      } finally {
        setUpdateCrashLoading(false);
        setTimeout(() => setUpdateCrashError(null), 50);
      }
    },
    [accessToken, getCrashes, recordEvent],
  );

  const [deleteCrashLoading, setDeleteCrashLoading] = useState(false);
  const [deleteCrashError, setDeleteCrashError] = useState<string | null>(null);

  /**
   * @description delete a single crash record
   */
  const deleteCrashRecord = useCallback(
    async (crashRecordId: string) => {
      setDeleteCrashLoading(true);
      try {
        await fetcher(`api/v1/deleteCrash?id=${crashRecordId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        recordEvent('Crash/PEM', 'Deleted', {
          $screen_name: 'EditCrashRecord',
        });

        await getCrashes();
        await getAllCrashes();
      } catch (err) {
        setDeleteCrashError(
          'Something went wrong deleting this crash, please try again in a few minutes.',
        );
      } finally {
        setDeleteCrashLoading(false);
        setTimeout(() => setDeleteCrashError(null), 50);
      }
    },
    [accessToken, getCrashes, getAllCrashes, recordEvent],
  );

  /**
   * @description effect that gets all crashes on mount
   */
  useEffect(() => {
    getAllCrashes();
  }, [getAllCrashes]);

  const value = useMemo(
    () => ({
      // get crashes for a given day
      getCrashes,
      crashes,
      setCrashes,
      getCrashesLoading,
      setGetCrashesLoading,
      getCrashesError,
      setGetCrashesError,
      // all crashes
      getAllCrashes,
      allCrashes,
      setAllCrashes,
      getAllCrashesLoading,
      setGetAllCrashesLoading,
      getAllCrashesError,
      setGetAllCrashesError,
      // crashes being edited
      crashBeingEdited,
      setCrashBeingEdited,
      showCrashSheet,
      setShowCrashSheet,
      // create crash record
      createCrashRecord,
      createCrashLoading,
      setCreateCrashLoading,
      createCrashError,
      setCreateCrashError,
      // update crash record
      updateCrashRecord,
      updateCrashLoading,
      setUpdateCrashLoading,
      updateCrashError,
      setUpdateCrashError,
      // delete crash record
      deleteCrashRecord,
      deleteCrashLoading,
      setDeleteCrashLoading,
      deleteCrashError,
      setDeleteCrashError,
      // historical time above limit
      historicalTimeAboveLimit,
      setHistoricalTimeAboveLimit,
    }),
    [
      allCrashes,
      crashBeingEdited,
      crashes,
      createCrashError,
      createCrashLoading,
      createCrashRecord,
      deleteCrashError,
      deleteCrashLoading,
      deleteCrashRecord,
      getAllCrashes,
      getAllCrashesError,
      getAllCrashesLoading,
      getCrashes,
      getCrashesError,
      getCrashesLoading,
      historicalTimeAboveLimit,
      showCrashSheet,
      updateCrashError,
      updateCrashLoading,
      updateCrashRecord,
    ],
  );

  return (
    <CrashesContext.Provider value={value}>{children}</CrashesContext.Provider>
  );
};

////
// HOOKS
////

export const useCrashesTimeFrame = (daysToFetch: number) => {
  const {accessToken, userId} = useAuth();
  const {actuallyToday} = useTodayDataContext();
  const {crashes} = useCrashesContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [crashesTimeFrame, setCrashesTimeFrame] = useState<Crash[] | null>(
    null,
  );

  const getCrashesTimeFrame = useCallback(async () => {
    const endDate = dayjs(actuallyToday).format('YYYY-MM-DD');

    setLoading(true);
    try {
      const response: GetResponse<Crash> = await fetcher(
        `api/v1/getCrashesTimeFrame?&date=${endDate}&userId=${userId}&daysToFetch=${daysToFetch}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      // if status is 404, 403, or 500
      if (response.status >= 400 || !Array.isArray(response.data)) {
        setCrashesTimeFrame(null);
      } else {
        setCrashesTimeFrame(response.data);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
      setTimeout(() => setError(null), 50);
    }
  }, [accessToken, actuallyToday, daysToFetch, userId]);

  useEffect(() => {
    getCrashesTimeFrame();
  }, [
    crashes,
    actuallyToday,
    userId,
    accessToken,
    daysToFetch,
    getCrashesTimeFrame,
  ]);

  return {crashesTimeFrame, loading, error};
};
