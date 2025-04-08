import React, {
  ReactNode,
  useState,
  useContext,
  SetStateAction,
  Dispatch,
  useCallback,
  createContext,
} from 'react';

import {UserMedication, MedicationRecord} from '@pathize/db';
import {fetcher} from '../utils';
import {useAuth} from '../CoreNav';
import {useTodayDataContext} from './DataTodayContext';
import {GetResponse, Medication, PostResponse} from '@pathize/api';
import {useAnalytics} from '../hooks';

export type MedicationsContext = {
  getUserMedications: () => Promise<void>;
  // add user medication
  // user medications
  userMedications: UserMedication[] | null;
  setUserMedications: Dispatch<SetStateAction<UserMedication[] | null>>;
  userMedicationsLoading: boolean;
  setUserMedicationsLoading: Dispatch<SetStateAction<boolean>>;
  userMedicationsError: string | null;
  setUserMedicationsError: Dispatch<SetStateAction<string | null>>;
  // medication records
  // search loading and error
  searchAllMedications: (query: string) => Promise<void>;
  medicationsFromSearch: Medication[] | null;
  medicationSearchLoading: boolean;
  setMedicationSearchLoading: Dispatch<SetStateAction<boolean>>;
  medicationSearchError: string | null;
  setMedicationSearchError: Dispatch<SetStateAction<string | null>>;
  // create a new user medication
  createUserMedication: (
    medicationId: string | null | undefined,
    medicationName: string,
    type: string,
    unit: string,
    strength: number,
    notes: string,
  ) => Promise<void>;
  createUserMedicationLoading: boolean;
  setCreateUserMedicationLoading: Dispatch<SetStateAction<boolean>>;
  createUserMedicationError: string | null;
  setCreateUserMedicationError: Dispatch<SetStateAction<string | null>>;
  // update a user medication
  updateUserMedication: (
    id: string,
    medicationName: string,
    type: string,
    strength: number,
    unit: string,
    notes: string,
  ) => Promise<void>;
  updateUserMedicationLoading: boolean;
  setUpdateUserMedicationLoading: Dispatch<SetStateAction<boolean>>;
  updateUserMedicationError: string | null;
  setUpdateUserMedicationError: Dispatch<SetStateAction<string | null>>;
  // delete user medication
  deleteUserMedication: (id: string) => Promise<void>;
  deleteUserMedicationLoading: boolean;
  setDeleteUserMedicationLoading: Dispatch<SetStateAction<boolean>>;
  deleteUserMedicationError: string | null;
  setDeleteUserMedicationError: Dispatch<SetStateAction<string | null>>;
  ////
  // RECORDS
  ////
  getMedicationRecords: () => Promise<void>;
  medicationRecords: MedicationRecord[] | null;
  setMedicationRecords: Dispatch<SetStateAction<MedicationRecord[] | null>>;
  medicationRecordsLoading: boolean;
  setMedicationRecordsLoading: Dispatch<SetStateAction<boolean>>;
  medicationRecordsError: string | null;
  setMedicationRecordsError: Dispatch<SetStateAction<string | null>>;
  // create medication record
  createMedicationRecord: (
    date: Date,
    createdDay: string,
    medicationId: string | null | undefined,
    userMedicationId: string | null | undefined,
    medicationName: string,
    type: string,
    unit: string,
    strength: number,
    shouldRefreshMedicationRecords?: boolean,
  ) => Promise<void>;
  createMedicationRecordLoading: boolean;
  setCreateMedicationRecordLoading: Dispatch<SetStateAction<boolean>>;
  createMedicationRecordError: string | null;
  setCreateMedicationRecordError: Dispatch<SetStateAction<string | null>>;
  // update medication record
  updateMedicationRecord: (id: string, time: Date) => Promise<void>;
  updateMedicationRecordLoading: boolean;
  setUpdateMedicationRecordLoading: Dispatch<SetStateAction<boolean>>;
  updateMedicationRecordError: string | null;
  setUpdateMedicationRecordError: Dispatch<SetStateAction<string | null>>;
  // delete medication record
  deleteMedicationRecord: (id: string) => Promise<void>;
  deleteMedicationRecordLoading: boolean;
  setDeleteMedicationRecordLoading: Dispatch<SetStateAction<boolean>>;
  deleteMedicationRecordError: string | null;
  setDeleteMedicationRecordError: Dispatch<SetStateAction<string | null>>;
};

const MedicationsContext = createContext<MedicationsContext | undefined>(
  undefined,
);

export const useMedicationsContext = () => {
  const context = useContext(MedicationsContext);
  if (context === undefined) {
    throw new Error(
      'useMedicationsContext must be used within a MedicationsProvider',
    );
  }

  return context;
};

export const MedicationsProvider = ({children}: {children: ReactNode}) => {
  const {accessToken, userId} = useAuth();
  const {today} = useTodayDataContext();
  const {recordEvent} = useAnalytics();

  const [userMedications, setUserMedications] = useState<
    UserMedication[] | null
  >(null);
  const [userMedicationsLoading, setUserMedicationsLoading] = useState(false);
  const [userMedicationsError, setUserMedicationsError] = useState<
    string | null
  >(null);

  /**
   * @description fetches all user medications
   */
  const getUserMedications = useCallback(async () => {
    setUserMedicationsLoading(true);
    try {
      const medicationsResponse: GetResponse<UserMedication> = await fetcher(
        `api/v1/getAllUserMedications?userId=${userId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      if (
        medicationsResponse.status === 404 ||
        !Array.isArray(medicationsResponse.data)
      ) {
        setUserMedications(null);
      } else {
        const sortedMedications = medicationsResponse.data.sort((a, b) => {
          return a.createdAt < b.createdAt ? 1 : -1;
        });
        setUserMedications(sortedMedications);
      }
    } catch (e) {
      setUserMedications(null);
      setUserMedicationsError(
        'There was an issue getting your list of medications. Please try again in a few minutes.',
      );
    } finally {
      setUserMedicationsLoading(false);
      setTimeout(() => setUserMedicationsError(null), 50);
    }
  }, [userId, accessToken]);

  const [medicationsFromSearch, setMedicationsFromSearch] = useState<
    Medication[] | null
  >(null);
  const [medicationSearchLoading, setMedicationSearchLoading] = useState(false);
  const [medicationSearchError, setMedicationSearchError] = useState<
    string | null
  >(null);

  /**
   * @description search medications database
   */
  const searchAllMedications = useCallback(
    async (query: string) => {
      setMedicationSearchLoading(true);
      try {
        const medicationsResponse: GetResponse<Medication> = await fetcher(
          `api/v1/searchMedicationsFromDb?query=${query}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
        if (
          medicationsResponse.status === 404 ||
          !Array.isArray(medicationsResponse.data)
        ) {
          setMedicationsFromSearch(null);
        } else {
          setMedicationsFromSearch(medicationsResponse.data);
        }
      } catch (e) {
        setMedicationsFromSearch(null);
        setMedicationSearchError(
          'There was an issue getting your list of medications. Please try again in a few minutes.',
        );
      } finally {
        setMedicationSearchLoading(false);
        setTimeout(() => setMedicationSearchError(null), 50);
      }
    },
    [accessToken],
  );

  const [createUserMedicationLoading, setCreateUserMedicationLoading] =
    useState(false);
  const [createUserMedicationError, setCreateUserMedicationError] = useState<
    string | null
  >(null);

  /**
   * @description creates a new user medication
   */
  const createUserMedication = async (
    medicationId: string | null | undefined,
    medicationName: string,
    type: string,
    unit: string,
    strength: number,
    notes: string,
  ) => {
    const responseBody = JSON.stringify({
      userId: userId,
      medicationId: medicationId,
      medicationName: medicationName,
      type: type,
      unit: unit,
      strength: strength,
      notes: notes,
    });

    setCreateUserMedicationLoading(true);
    try {
      const response: PostResponse<UserMedication> = await fetcher(
        'api/v1/createUserMedication',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: responseBody,
        },
      );

      if (response.status === 400) {
        setCreateUserMedicationError(
          'A medication with this name exists already. Please choose a different name',
        );
      } else {
        recordEvent('User Medication', 'Created', {
          $screen_name: 'NewUserMedicationConfirm',
        });
        getUserMedications();
      }
    } catch (err) {
      setCreateUserMedicationError(
        'Something went wrong saving this medication',
      );
    } finally {
      setCreateUserMedicationLoading(false);
      setTimeout(() => setCreateUserMedicationError(null), 50);
    }
  };

  const [updateUserMedicationLoading, setUpdateUserMedicationLoading] =
    useState(false);
  const [updateUserMedicationError, setUpdateUserMedicationError] = useState<
    string | null
  >(null);

  /**
   * @description update a user medication
   */
  const updateUserMedication = async (
    id: string,
    medicationName: string,
    type: string,
    strength: number,
    unit: string,
    notes: string,
  ) => {
    const responseBody = JSON.stringify({
      id: id,
      medicationName: medicationName,
      type: type,
      strength: strength,
      unit: unit,
      notes: notes,
    });

    setUpdateUserMedicationLoading(true);
    try {
      await fetcher('api/v1/updateUserMedication', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: responseBody,
      });

      recordEvent('User Medication', 'Updated', {
        $screen_name: 'UserMedications',
      });
      getUserMedications();
    } catch (err) {
      setUpdateUserMedicationError(
        'Something went wrong saving this medication. Please try again in a couple of minutes.',
      );
    } finally {
      setUpdateUserMedicationLoading(false);
      setTimeout(() => setUpdateUserMedicationError(null), 50);
    }
  };

  const [deleteUserMedicationLoading, setDeleteUserMedicationLoading] =
    useState(false);
  const [deleteUserMedicationError, setDeleteUserMedicationError] = useState<
    string | null
  >(null);

  /**
   * @description delete a user medication
   */
  const deleteUserMedication = async (id: string) => {
    setDeleteUserMedicationLoading(true);
    try {
      await fetcher(`api/v1/deleteUserMedication?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      recordEvent('User Medication', 'Deleted', {
        $screen_name: 'UserMedications',
      });
      getUserMedications();
    } catch (err) {
      setDeleteUserMedicationError(
        'Something went wrong deleting this medication. Please try again in a couple of minutes.',
      );
    } finally {
      setDeleteUserMedicationLoading(false);
      setTimeout(() => setDeleteUserMedicationError(null), 50);
    }
  };

  ////
  // RECORDS
  ////

  const [medicationRecords, setMedicationRecords] = useState<
    MedicationRecord[] | null
  >(null);
  const [medicationRecordsLoading, setMedicationRecordsLoading] =
    useState(false);
  const [medicationRecordsError, setMedicationRecordsError] = useState<
    string | null
  >(null);

  /**
   * @description fetches all medication records for the current day
   */
  const getMedicationRecords = useCallback(async () => {
    setMedicationRecordsLoading(true);
    try {
      const medicationsResponse: GetResponse<MedicationRecord> = await fetcher(
        `api/v1/getMedicationRecords?userId=${userId}&day=${today}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (
        medicationsResponse.status === 404 ||
        medicationsResponse.status === 500
      ) {
        setMedicationRecords(null);
      } else {
        setMedicationRecords(
          (medicationsResponse.data as MedicationRecord[]).sort((a, b) => {
            return a.time > b.time ? 1 : -1;
          }),
        );
      }
    } catch (e) {
      setMedicationRecords(null);
      setMedicationRecordsError(
        'There was an issue getting your list of medications. Please try again in a few minutes.',
      );
    } finally {
      setMedicationRecordsLoading(false);
      setTimeout(() => setMedicationRecordsError(null), 50);
    }
  }, [accessToken, today, userId]);

  const [createMedicationRecordLoading, setCreateMedicationRecordLoading] =
    useState(false);
  const [createMedicationRecordError, setCreateMedicationRecordError] =
    useState<string | null>(null);

  /**
   * @description creates a new medication record
   */
  const createMedicationRecord = useCallback(
    async (
      date: Date,
      createdDay: string,
      medicationId: string | null | undefined,
      userMedicationId: string | null | undefined,
      medicationName: string,
      type: string,
      unit: string,
      strength: number,
      shouldRefreshMedicationRecords?: boolean,
    ) => {
      const responseBody = JSON.stringify({
        userId: userId,
        time: date,
        createdDay: createdDay,
        medicationId: medicationId,
        userMedicationId: userMedicationId,
        medicationName: medicationName,
        type: type,
        unit: unit,
        strength: strength,
      });

      setCreateMedicationRecordLoading(true);
      try {
        await fetcher('api/v1/createMedicationRecord', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: responseBody,
        });

        recordEvent('Medication Record', 'Created', {
          $screen_name: 'ConfirmNewMedicationRecord',
        });
        shouldRefreshMedicationRecords && getMedicationRecords();
      } catch (err) {
        setCreateMedicationRecordError(
          'Something went wrong saving this crash',
        );
      } finally {
        setCreateMedicationRecordLoading(false);
        setTimeout(() => setCreateMedicationRecordError(null), 50);
      }
    },
    [userId, accessToken, recordEvent, getMedicationRecords],
  );

  const [updateMedicationRecordLoading, setUpdateMedicationRecordLoading] =
    useState(false);
  const [updateMedicationRecordError, setUpdateMedicationRecordError] =
    useState<string | null>(null);

  /**
   * @description update a medication record
   */
  const updateMedicationRecord = useCallback(
    async (id: string, time: Date) => {
      const responseBody = JSON.stringify({
        id: id,
        time: time,
      });

      setUpdateMedicationRecordLoading(true);
      try {
        await fetcher('api/v1/updateMedicationRecord', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: responseBody,
        });

        recordEvent('Medication Record', 'Updated', {
          $screen_name: 'EditMedicationRecord',
        });
        getMedicationRecords();
      } catch (err) {
        setUpdateMedicationRecordError(
          'Something went wrong saving this medication. Please try again in a couple of minutes.',
        );
      } finally {
        setUpdateMedicationRecordLoading(false);
        setTimeout(() => setUpdateMedicationRecordError(null), 50);
      }
    },
    [accessToken, recordEvent, getMedicationRecords],
  );

  const [deleteMedicationRecordLoading, setDeleteMedicationRecordLoading] =
    useState(false);
  const [deleteMedicationRecordError, setDeleteMedicationRecordError] =
    useState<string | null>(null);

  /**
   * @description delete a medication record
   */
  const deleteMedicationRecord = useCallback(
    async (medicationRecordId: string) => {
      setDeleteMedicationRecordLoading(true);
      try {
        await fetcher(
          `api/v1/deleteMedicationRecord?id=${medicationRecordId}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        recordEvent('Medication Record', 'Deleted', {
          $screen_name: 'EditMedicationRecord',
        });
        await getMedicationRecords();
      } catch (err) {
        setDeleteMedicationRecordError(
          'Something went wrong deleting this medication. Please try again in a couple of minutes.',
        );
      } finally {
        setDeleteMedicationRecordLoading(false);
        setTimeout(() => setDeleteMedicationRecordError(null), 50);
      }
    },
    [accessToken, recordEvent, getMedicationRecords],
  );

  return (
    <MedicationsContext.Provider
      value={{
        getUserMedications,
        // user medications
        userMedications,
        setUserMedications,
        userMedicationsLoading,
        setUserMedicationsLoading,
        userMedicationsError,
        setUserMedicationsError,
        // searching medications
        searchAllMedications,
        medicationsFromSearch,
        medicationSearchLoading,
        setMedicationSearchLoading,
        medicationSearchError,
        setMedicationSearchError,
        // create a new user medication
        createUserMedication,
        createUserMedicationLoading,
        setCreateUserMedicationLoading,
        createUserMedicationError,
        setCreateUserMedicationError,
        // update a user medication
        updateUserMedication,
        updateUserMedicationLoading,
        setUpdateUserMedicationLoading,
        updateUserMedicationError,
        setUpdateUserMedicationError,
        // delete user medication
        deleteUserMedication,
        deleteUserMedicationLoading,
        setDeleteUserMedicationLoading,
        deleteUserMedicationError,
        setDeleteUserMedicationError,
        ////
        // RECORDS
        ////
        getMedicationRecords,
        medicationRecords,
        setMedicationRecords,
        medicationRecordsLoading,
        setMedicationRecordsLoading,
        medicationRecordsError,
        setMedicationRecordsError,
        // create medication record
        createMedicationRecord,
        createMedicationRecordLoading,
        setCreateMedicationRecordLoading,
        createMedicationRecordError,
        setCreateMedicationRecordError,
        // update medication record
        updateMedicationRecord,
        updateMedicationRecordLoading,
        setUpdateMedicationRecordLoading,
        updateMedicationRecordError,
        setUpdateMedicationRecordError,
        // delete medication record
        deleteMedicationRecord,
        deleteMedicationRecordLoading,
        setDeleteMedicationRecordLoading,
        deleteMedicationRecordError,
        setDeleteMedicationRecordError,
      }}>
      {children}
    </MedicationsContext.Provider>
  );
};
