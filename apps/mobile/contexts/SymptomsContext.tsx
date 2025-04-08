import React, {
  ReactNode,
  useState,
  useContext,
  createContext,
  SetStateAction,
  Dispatch,
  useCallback,
} from 'react';

import {SymptomRecord, UserSymptom} from '@pathize/db';
import {fetcher} from '../utils';
import {useAuth} from '../CoreNav';
import {useTodayDataContext} from './DataTodayContext';
import {GetResponse, SearchResponse, Symptom} from '@pathize/api';
import {useAnalytics} from '../hooks';

export type SymptomsContext = {
  // Get user symptoms and symptom records
  getSymptomRecords: () => Promise<void>;
  getUserSymptoms: () => Promise<void>;
  // Symptom records
  symptomRecords: SymptomRecord[] | null;
  setSymptomRecords: Dispatch<SetStateAction<SymptomRecord[] | null>>;
  getSymptomRecordsLoading: boolean;
  setGetSymptomRecordsLoading: Dispatch<SetStateAction<boolean>>;
  getSymptomRecordsError: string | null;
  setGetSymptomRecordsError: Dispatch<SetStateAction<string | null>>;
  // User symptoms
  userSymptoms: UserSymptom[] | null;
  setUserSymptoms: Dispatch<SetStateAction<UserSymptom[] | null>>;
  getUserSymptomsLoading: boolean;
  setUserSymptomsLoading: Dispatch<SetStateAction<boolean>>;
  getUserSymptomsError: string | null;
  setUserSymptomsError: Dispatch<SetStateAction<string | null>>;
  // search symptoms from DB
  searchAllSymptoms: (query: string) => Promise<void>;
  symptomsFromSearch: Symptom[] | null;
  setSymptomsFromSearch: Dispatch<SetStateAction<Symptom[] | null>>;
  symptomSearchLoading: boolean;
  setSymptomSearchLoading: Dispatch<SetStateAction<boolean>>;
  symptomSearchError: string | null;
  setSymptomSearchError: Dispatch<SetStateAction<string | null>>;
  // create user symptom
  createUserSymptom: (
    symptom: Omit<UserSymptom, 'createdAt' | 'id'>,
  ) => Promise<void>;
  createUserSymptomLoading: boolean;
  setCreateUserSymptomLoading: Dispatch<SetStateAction<boolean>>;
  createUserSymptomError: string | null;
  setCreateUserSymptomError: Dispatch<SetStateAction<string | null>>;
  // update user symptom
  updateUserSymptom: (
    id: string,
    symptomId: string | null | undefined,
    category: string,
    name: string,
    notes: string,
  ) => Promise<void>;
  updateUserSymptomLoading: boolean;
  setUpdateUserSymptomLoading: Dispatch<SetStateAction<boolean>>;
  updateUserSymptomError: string | null;
  setUpdateUserSymptomError: Dispatch<SetStateAction<string | null>>;
  // delete user symptom
  deleteUserSymptom: (id: string) => Promise<void>;
  deleteUserSymptomLoading: boolean;
  setDeleteUserSymptomLoading: Dispatch<SetStateAction<boolean>>;
  deleteUserSymptomError: string | null;
  setDeleteUserSymptomError: Dispatch<SetStateAction<string | null>>;
  // create symptom record
  createSymptomRecord: (
    time: Date,
    createdDay: string,
    symptomId: string | null,
    userSymptomId: string,
    symptomSeverity: number,
    symptomName: string,
    symptomDescription: string | null,
    symptomCategory: string,
    shouldRefreshSymptomRecords?: boolean,
  ) => Promise<void>;
  createSymptomRecordLoading: boolean;
  setCreateSymptomRecordLoading: Dispatch<SetStateAction<boolean>>;
  createSymptomRecordError: string | null;
  setCreateSymptomRecordError: Dispatch<SetStateAction<string | null>>;
  // update symptom record
  updateSymptomRecord: (
    id: string,
    time: Date,
    symptomSeverity: number,
  ) => Promise<void>;
  updateSymptomRecordLoading: boolean;
  setUpdateSymptomRecordLoading: Dispatch<SetStateAction<boolean>>;
  updateSymptomRecordError: string | null;
  setUpdateSymptomRecordError: Dispatch<SetStateAction<string | null>>;
  // delete symptom record
  deleteSymptomRecord: (id: string) => Promise<void>;
  deleteSymptomRecordLoading: boolean;
  setDeleteSymptomRecordLoading: Dispatch<SetStateAction<boolean>>;
  deleteSymptomRecordError: string | null;
  setDeleteSymptomRecordError: Dispatch<SetStateAction<string | null>>;
};

const SymptomsContext = createContext<SymptomsContext | undefined>(undefined);

export const useSymptomsContext = () => {
  const context = useContext(SymptomsContext);

  if (context === undefined) {
    throw new Error(
      'useSymptomsContext must be used within a SymptomsProvider',
    );
  }

  return context;
};

export const SymptomsProvider = ({children}: {children: ReactNode}) => {
  const {userId, accessToken} = useAuth();
  const {recordEvent} = useAnalytics();
  const {today} = useTodayDataContext();

  // user symptoms
  const [userSymptoms, setUserSymptoms] = useState<UserSymptom[] | null>(null);
  const [getUserSymptomsLoading, setUserSymptomsLoading] = useState(false);
  const [getUserSymptomsError, setUserSymptomsError] = useState<string | null>(
    null,
  );

  /**
   * @description get all user symptoms
   */
  const getUserSymptoms = useCallback(async () => {
    setUserSymptomsLoading(true);
    try {
      const response: GetResponse<UserSymptom> = await fetcher(
        `api/v1/getUserSymptoms?userId=${userId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (response.status === 200 && Array.isArray(response.data)) {
        setUserSymptoms(response.data);
      } else {
        setUserSymptoms(null);
      }
    } catch (err) {
      setUserSymptomsError('There was an issue getting your symptoms');
    } finally {
      setUserSymptomsLoading(false);
      setTimeout(() => setUserSymptomsError(null), 50);
    }
  }, [userId, accessToken]);

  const [symptomsFromSearch, setSymptomsFromSearch] = useState<
    Symptom[] | null
  >(null);
  const [symptomSearchLoading, setSymptomSearchLoading] = useState(false);
  const [symptomSearchError, setSymptomSearchError] = useState<string | null>(
    null,
  );

  /**
   * @description search all symptoms from DB
   */
  const searchAllSymptoms = useCallback(
    async (query: string) => {
      setSymptomSearchLoading(true);
      try {
        const response: SearchResponse<Symptom> = await fetcher(
          `api/v1/searchSymptomsFromDb?searchQuery=${query}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        if (response.status === 200 && Array.isArray(response.data)) {
          setSymptomsFromSearch(response.data);
        } else {
          setSymptomsFromSearch(null);
        }
      } catch (err) {
        setSymptomSearchError('There was an issue getting your symptoms');
      } finally {
        setSymptomSearchLoading(false);
        setTimeout(() => setSymptomSearchError(null), 50);
      }
    },
    [accessToken],
  );

  const [createUserSymptomLoading, setCreateUserSymptomLoading] =
    useState(false);
  const [createUserSymptomError, setCreateUserSymptomError] = useState<
    string | null
  >(null);

  /**
   * @description create a new user symptom
   */
  const createUserSymptom = useCallback(
    async (symptom: Omit<UserSymptom, 'createdAt' | 'id' | 'userId'>) => {
      setCreateUserSymptomLoading(true);
      try {
        const response: GetResponse<UserSymptom> = await fetcher(
          'api/v1/createUserSymptom',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              ...symptom,
              userId: userId,
            }),
          },
        );

        if (response.status === 400) {
          setCreateUserSymptomError(
            'Symptom name already exists with this name! Please choose a different name.',
          );
        } else {
          getUserSymptoms();
          recordEvent('User Symptom', 'Created', {
            $screen_name: 'NewUserSymptomConfirm',
          });
        }
      } catch (err) {
        setCreateUserSymptomError('There was an issue creating your symptom');
      } finally {
        setCreateUserSymptomLoading(false);
        setTimeout(() => setCreateUserSymptomError(null), 50);
      }
    },
    [accessToken, getUserSymptoms, recordEvent, userId],
  );

  const [updateUserSymptomLoading, setUpdateUserSymptomLoading] =
    useState(false);
  const [updateUserSymptomError, setUpdateUserSymptomError] = useState<
    string | null
  >(null);

  /**
   * @description update a user symptom
   */
  const updateUserSymptom = useCallback(
    async (
      id: string,
      symptomId: string | null | undefined,
      category: string,
      name: string,
      notes: string,
    ) => {
      const responseBody = JSON.stringify({
        id: id,
        symptomId: symptomId,
        category: category,
        name: name,
        notes: notes,
      });

      setUpdateUserSymptomLoading(true);
      try {
        await fetcher('api/v1/updateUserSymptom', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: responseBody,
        });

        recordEvent('User Symptom', 'Updated', {
          $screen_name: 'EditUserSymptom',
        });
        getUserSymptoms();
      } catch (err) {
        setUpdateUserSymptomError(
          'There was an issue updating your symptom. Please try again in a coupe minutes.',
        );
      } finally {
        setUpdateUserSymptomLoading(false);
        setTimeout(() => setUpdateUserSymptomError(null), 50);
      }
    },
    [accessToken, getUserSymptoms, recordEvent],
  );

  const [deleteUserSymptomLoading, setDeleteUserSymptomLoading] =
    useState(false);
  const [deleteUserSymptomError, setDeleteUserSymptomError] = useState<
    string | null
  >(null);

  /**
   * @description delete a user symptom
   */
  const deleteUserSymptom = useCallback(
    async (id: string) => {
      setDeleteUserSymptomLoading(true);
      try {
        await fetcher(`api/v1/deleteUserSymptom?id=${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        recordEvent('User Symptom', 'Deleted', {
          $screen_name: 'EditUserSymptom',
        });
        getUserSymptoms();
      } catch (err) {
        setDeleteUserSymptomError(
          'There was an issue deleting your symptom. Please try again in a coupe minutes.',
        );
      } finally {
        setDeleteUserSymptomLoading(false);
        setTimeout(() => setDeleteUserSymptomError(null), 50);
      }
    },
    [accessToken, getUserSymptoms, recordEvent],
  );

  ////
  // RECORDS
  ////

  const [symptomRecords, setSymptomRecords] = useState<SymptomRecord[] | null>(
    null,
  );
  const [getSymptomRecordsLoading, setGetSymptomRecordsLoading] =
    useState(false);
  const [getSymptomRecordsError, setGetSymptomRecordsError] = useState<
    string | null
  >(null);

  /**
   * @description get all symptom records for a current day
   */
  const getSymptomRecords = useCallback(async () => {
    setGetSymptomRecordsLoading(true);
    try {
      const symptomsResponse: GetResponse<SymptomRecord> = await fetcher(
        `api/v1/getSymptomRecords?userId=${userId}&day=${today}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (
        symptomsResponse.status === 400 ||
        !Array.isArray(symptomsResponse.data)
      ) {
        setSymptomRecords(null);
      } else {
        setSymptomRecords(
          symptomsResponse.data.sort((a, b) => {
            return a.time > b.time ? 1 : -1;
          }),
        );
      }
    } catch (e) {
      setGetSymptomRecordsError('Something went wrong getting your symptoms');
    } finally {
      setGetSymptomRecordsLoading(false);
      setTimeout(() => setGetSymptomRecordsError(null), 50);
    }

    setUserSymptomsLoading(false);
  }, [userId, accessToken, today]);

  const [createSymptomRecordLoading, setCreateSymptomRecordLoading] =
    useState(false);
  const [createSymptomRecordError, setCreateSymptomRecordError] = useState<
    string | null
  >(null);

  /**
   * @description create a new symptom record
   */
  const createSymptomRecord = useCallback(
    async (
      time: Date,
      createdDay: string,
      symptomId: string | null,
      userSymptomId: string,
      symptomSeverity: number,
      symptomName: string,
      symptomDescription: string | null,
      symptomCategory: string,
      shouldRefreshSymptomRecords?: boolean,
    ) => {
      const responseBody = JSON.stringify({
        userId: userId,
        time: time,
        createdDay: createdDay,
        symptomId: symptomId,
        userSymptomId: userSymptomId,
        symptomSeverity: symptomSeverity,
        symptomName: symptomName,
        symptomDescription: symptomDescription,
        symptomCategory: symptomCategory,
      });

      setCreateSymptomRecordLoading(true);

      try {
        await fetcher('api/v1/createSymptomRecord', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: responseBody,
        });

        recordEvent('Symptom Record', 'Created', {
          $screen_name: 'ConfirmNewSymptomRecord',
        });
        shouldRefreshSymptomRecords && getSymptomRecords();
      } catch (err) {
        setCreateSymptomRecordError(
          'There was an issue creating your symptom record. Please try again in a coupe minutes.',
        );
      } finally {
        setCreateSymptomRecordLoading(false);
        setTimeout(() => setCreateSymptomRecordError(null), 50);
      }
    },
    [accessToken, getSymptomRecords, userId, recordEvent],
  );

  const [updateSymptomRecordLoading, setUpdateSymptomRecordLoading] =
    useState(false);
  const [updateSymptomRecordError, setUpdateSymptomRecordError] = useState<
    string | null
  >(null);

  /**
   * @description update a symptom record
   */
  const updateSymptomRecord = useCallback(
    async (id: string, time: Date, symptomSeverity: number) => {
      const responseBody = JSON.stringify({
        id: id,
        time: time,
        severity: symptomSeverity,
      });

      setUpdateSymptomRecordLoading(true);
      try {
        await fetcher('api/v1/updateSymptomRecord', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: responseBody,
        });

        recordEvent('Symptom Record', 'Updated', {
          $screen_name: 'EditSymptomRecord',
        });
        getSymptomRecords();
      } catch (err) {
        setUpdateSymptomRecordError(
          'There was an issue updating your symptom record. Please try again in a coupe minutes.',
        );
      } finally {
        setUpdateSymptomRecordLoading(false);
        setTimeout(() => setUpdateSymptomRecordError(null), 50);
      }
    },
    [accessToken, getSymptomRecords, recordEvent],
  );

  const [deleteSymptomRecordLoading, setDeleteSymptomRecordLoading] =
    useState(false);
  const [deleteSymptomRecordError, setDeleteSymptomRecordError] = useState<
    string | null
  >(null);

  /**
   * @description delete a symptom record
   */
  const deleteSymptomRecord = useCallback(
    async (id: string) => {
      setDeleteSymptomRecordLoading(true);

      try {
        await fetcher(`api/v1/deleteSymptomRecord?id=${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        recordEvent('Symptom Record', 'Deleted', {
          $screen_name: 'EditSymptomRecord',
        });
        await getSymptomRecords();
      } catch (err) {
        setDeleteSymptomRecordError(
          'There was an issue deleting your symptom record. Please try again in a coupe minutes.',
        );
      } finally {
        setDeleteSymptomRecordLoading(false);
        setTimeout(() => setDeleteSymptomRecordError(null), 50);
      }
    },
    [accessToken, getSymptomRecords, recordEvent],
  );

  return (
    <SymptomsContext.Provider
      value={{
        getSymptomRecords,
        getUserSymptoms,
        // symptom records
        symptomRecords,
        setSymptomRecords,
        getSymptomRecordsLoading,
        setGetSymptomRecordsLoading,
        getSymptomRecordsError,
        setGetSymptomRecordsError,
        // user symptoms
        userSymptoms,
        setUserSymptoms,
        getUserSymptomsLoading,
        setUserSymptomsLoading,
        getUserSymptomsError,
        setUserSymptomsError,
        // symptom search
        searchAllSymptoms,
        symptomsFromSearch,
        setSymptomsFromSearch,
        symptomSearchLoading,
        setSymptomSearchLoading,
        symptomSearchError,
        setSymptomSearchError,
        // create user symptom
        createUserSymptom,
        createUserSymptomLoading,
        setCreateUserSymptomLoading,
        createUserSymptomError,
        setCreateUserSymptomError,
        // update user symptom
        updateUserSymptom,
        updateUserSymptomLoading,
        setUpdateUserSymptomLoading,
        updateUserSymptomError,
        setUpdateUserSymptomError,
        // delete user symptom
        deleteUserSymptom,
        deleteUserSymptomLoading,
        setDeleteUserSymptomLoading,
        deleteUserSymptomError,
        setDeleteUserSymptomError,
        // create symptom record
        createSymptomRecord,
        createSymptomRecordLoading,
        setCreateSymptomRecordLoading,
        createSymptomRecordError,
        setCreateSymptomRecordError,
        // update symptom record
        updateSymptomRecord,
        updateSymptomRecordLoading,
        setUpdateSymptomRecordLoading,
        updateSymptomRecordError,
        setUpdateSymptomRecordError,
        // delete symptom record
        deleteSymptomRecord,
        deleteSymptomRecordLoading,
        setDeleteSymptomRecordLoading,
        deleteSymptomRecordError,
        setDeleteSymptomRecordError,
      }}>
      {children}
    </SymptomsContext.Provider>
  );
};
