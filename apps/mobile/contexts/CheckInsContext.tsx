import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {CheckInComplete, UserMedication, UserSymptom} from '@pathize/db';
import {useAuth} from '../CoreNav';
import {useAnalytics} from '../hooks';
import {
  getCheckIns as getCheckInsFromDb,
  createCheckIn as createCheckInFromDb,
  updateCheckIn as updateCheckInFromDb,
  deleteCheckIn as deleteCheckInFromDb,
} from '../features/checkIns';
import {createSymptomRecord} from '../features/symptoms';
import {createMedicationRecord} from '../features/medications';
import {useTodayDataContext} from './DataTodayContext';
import {useMedicationsContext} from './MedicationsContext';
import {useSymptomsContext} from './SymptomsContext';

export type CheckInsContext = {
  checkIns: CheckInComplete[];
  setCheckIns: Dispatch<SetStateAction<CheckInComplete[]>>;
  ////
  // CRUD ON CHECK-INS
  ////
  getCheckIns: () => Promise<void>;
  getCheckInsLoading: boolean;
  setGetCheckInsLoading: Dispatch<SetStateAction<boolean>>;
  getCheckInsError: string | null;
  setGetCheckInsError: Dispatch<SetStateAction<string | null>>;
  // CREATE A CHECK-IN
  createCheckIn: (
    name: string,
    time: Date,
    notificationsEnabled: boolean,
    userMedicationIds: string[],
    userSymptomIds: string[],
  ) => Promise<void>;
  createCheckInLoading: boolean;
  setCreateCheckInLoading: Dispatch<SetStateAction<boolean>>;
  createCheckInError: string | null;
  setCreateCheckInError: Dispatch<SetStateAction<string | null>>;
  // UPDATE CHECK-INS
  updateCheckIn: (
    checkInId: string,
    name: string,
    time: Date,
    notificationsEnabled: boolean,
    userMedicationIds: string[],
    userSymptomIds: string[],
  ) => Promise<void>;
  updateCheckInLoading: boolean;
  setUpdateCheckInLoading: Dispatch<SetStateAction<boolean>>;
  updateCheckInError: string | null;
  setUpdateCheckInError: Dispatch<SetStateAction<string | null>>;
  // DELETE CHECK INS
  deleteCheckIn: (checkInId: string) => Promise<void>;
  deleteCheckInLoading: boolean;
  setDeleteCheckInLoading: Dispatch<SetStateAction<boolean>>;
  deleteCheckInError: string | null;
  setDeleteCheckInError: Dispatch<SetStateAction<string | null>>;
  // RECORD A CHECK-IN
  recordCheckIn: (
    checkInId: string,
    symptoms?: (UserSymptom & {severity: number})[],
    medications?: UserMedication[],
  ) => Promise<void>;
  recordCheckInLoading: boolean;
  setRecordCheckInLoading: Dispatch<SetStateAction<boolean>>;
  recordCheckInError: string | null;
  setRecordCheckInError: Dispatch<SetStateAction<string | null>>;
};

const CheckInsContext = createContext<CheckInsContext | undefined>(undefined);

export const useCheckInsContext = () => {
  const context = useContext(CheckInsContext);
  if (context === undefined) {
    throw new Error(
      'useCheckInsContext must be used within a CheckInsContextProvider',
    );
  }

  return context;
};

export const CheckInsProvider = ({children}: {children: ReactNode}) => {
  const {userId, accessToken} = useAuth();
  const {today} = useTodayDataContext();
  const {getMedicationRecords} = useMedicationsContext();
  const {getSymptomRecords} = useSymptomsContext();
  const {recordEvent} = useAnalytics();

  const [checkIns, setCheckIns] = useState<CheckInComplete[]>([]);
  const [getCheckInsLoading, setGetCheckInsLoading] = useState<boolean>(false);
  const [getCheckInsError, setGetCheckInsError] = useState<string | null>(null);

  /**
   * @description gets the check-ins for a given user
   */
  const getCheckIns = useCallback(async () => {
    setGetCheckInsLoading(true);

    try {
      const response = await getCheckInsFromDb(userId, accessToken);

      if (response.success) {
        setCheckIns(response.data as CheckInComplete[]);
      } else {
        setGetCheckInsError(response.error as string);
      }
    } catch (err) {
      setGetCheckInsError('There was an error getting your check-ins.');
    } finally {
      setGetCheckInsLoading(false);
      setTimeout(() => setGetCheckInsError(null), 50);
    }

    setGetCheckInsLoading(false);
    setTimeout(() => setGetCheckInsError(null), 50);
  }, [accessToken, userId]);

  const [createCheckInLoading, setCreateCheckInLoading] =
    useState<boolean>(false);
  const [createCheckInError, setCreateCheckInError] = useState<string | null>(
    null,
  );

  /**
   * @description creates a check-in for a given user
   */
  const createCheckIn = useCallback(
    async (
      name: string,
      time: Date,
      notificationsEnabled: boolean = true,
      userMedicationIds: string[],
      userSymptomIds: string[],
    ) => {
      setCreateCheckInLoading(true);

      try {
        const response = await createCheckInFromDb(
          userId,
          name,
          time,
          notificationsEnabled,
          userMedicationIds,
          userSymptomIds,
          accessToken,
        );

        if (response.success) {
          recordEvent('Check In', 'Created', {
            $screen_name: 'NewCheckInConfirm',
            value: name,
          });

          await getCheckIns();
        } else {
          setCreateCheckInError(response.error as string);
        }
      } catch (err) {
        console.log(err);
        setCreateCheckInError('There was an error creating your check-in.');
      } finally {
        setCreateCheckInLoading(false);
        setTimeout(() => setCreateCheckInError(null), 50);
      }
    },
    [accessToken, getCheckIns, recordEvent, userId],
  );

  const [updateCheckInLoading, setUpdateCheckInLoading] =
    useState<boolean>(false);
  const [updateCheckInError, setUpdateCheckInError] = useState<string | null>(
    null,
  );

  /**
   * @description updates a check-in for a given user
   */
  const updateCheckIn = useCallback(
    async (
      checkInId: string,
      name: string,
      time: Date,
      notificationsEnabled: boolean = true,
      userMedicationIds: string[],
      userSymptomIds: string[],
    ) => {
      setUpdateCheckInLoading(true);

      try {
        const response = await updateCheckInFromDb(
          checkInId,
          name,
          time,
          notificationsEnabled,
          userMedicationIds,
          userSymptomIds,
          accessToken,
        );

        if (response.success) {
          recordEvent('Check In', 'Updated', {
            $screen_name: 'EditCheckIn',
            value: name,
          });

          await getCheckIns();
        } else {
          console.log(response.error);
          setUpdateCheckInError(response.error as string);
        }
      } catch (err) {
        setUpdateCheckInError('There was an error updating your check-in.');
      } finally {
        setUpdateCheckInLoading(false);
        setTimeout(() => setUpdateCheckInError(null), 50);
      }
    },
    [accessToken, getCheckIns, recordEvent],
  );

  const [deleteCheckInLoading, setDeleteCheckInLoading] =
    useState<boolean>(false);
  const [deleteCheckInError, setDeleteCheckInError] = useState<string | null>(
    null,
  );

  /**
   * @description deletes a check-in for a given user
   */
  const deleteCheckIn = useCallback(
    async (checkInId: string) => {
      setDeleteCheckInLoading(true);

      try {
        const response = await deleteCheckInFromDb(checkInId, accessToken);
        if (response.success) {
          recordEvent('Check In', 'Deleted', {
            $screen_name: 'EditCheckIn',
            value: checkInId,
          });

          await getCheckIns();
        } else {
          setDeleteCheckInError(response.error as string);
        }
      } catch (err) {
        setDeleteCheckInError('There was an error deleting your check-in.');
      } finally {
        setDeleteCheckInLoading(false);
        setTimeout(() => setDeleteCheckInError(null), 50);
      }
    },
    [accessToken, getCheckIns, recordEvent],
  );

  const [recordCheckInLoading, setRecordCheckInLoading] =
    useState<boolean>(false);
  const [recordCheckInError, setRecordCheckInError] = useState<string | null>(
    null,
  );

  /**
   * @description records a check-in for a given user (given a list of medications and/or symptoms with an associated set of checkInIds)
   */
  const recordCheckIn = useCallback(
    async (
      checkInId: string,
      symptoms?: (UserSymptom & {severity: number})[],
      medications?: UserMedication[],
    ) => {
      setRecordCheckInLoading(true);
      try {
        // if there are symptoms to record as a part of this check-in
        if (symptoms) {
          await Promise.allSettled(
            symptoms.map(async symptom => {
              const response = await createSymptomRecord(
                userId,
                accessToken,
                new Date(),
                today,
                symptom.symptomId,
                symptom.id,
                symptom.severity,
                symptom.name!,
                symptom.description,
                symptom.category!,
                checkInId,
              );
              if (response.success) {
                recordEvent('Symptom Record', 'Created', {
                  $screen_name: 'RecordCheckIn',
                });
              }
            }),
          );

          await getSymptomRecords();
        }

        // if there are medications to record as a part of this check-in
        if (medications) {
          await Promise.allSettled(
            medications.map(async medication => {
              const response = await createMedicationRecord(
                userId,
                accessToken,
                new Date(),
                today,
                medication.medicationId,
                medication.id,
                medication.medicationName!,
                medication.type,
                medication.unit!,
                medication.strength!,
                checkInId,
              );

              if (response.success) {
                recordEvent('Medication Record', 'Created', {
                  $screen_name: 'RecordCheckIn',
                });
              }
            }),
          );

          await getMedicationRecords();
        }
      } catch (err) {
        console.log(err);
        setRecordCheckInError('There was an error saving your check-in.');
      } finally {
        setRecordCheckInLoading(false);
        setTimeout(() => setRecordCheckInError(null), 50);
      }
    },
    [
      accessToken,
      getMedicationRecords,
      getSymptomRecords,
      recordEvent,
      today,
      userId,
    ],
  );

  const value = useMemo(
    () => ({
      checkIns,
      setCheckIns,
      getCheckIns,
      getCheckInsLoading,
      setGetCheckInsLoading,
      getCheckInsError,
      setGetCheckInsError,
      // CREATE A CHECK-IN
      createCheckIn,
      createCheckInLoading,
      setCreateCheckInLoading,
      createCheckInError,
      setCreateCheckInError,
      // UPDATE CHECK-INS
      updateCheckIn,
      updateCheckInLoading,
      setUpdateCheckInLoading,
      updateCheckInError,
      setUpdateCheckInError,
      // DELETE CHECK INS
      deleteCheckIn,
      deleteCheckInLoading,
      setDeleteCheckInLoading,
      deleteCheckInError,
      setDeleteCheckInError,
      // RECORD A CHECK-IN
      recordCheckIn,
      recordCheckInLoading,
      setRecordCheckInLoading,
      recordCheckInError,
      setRecordCheckInError,
    }),
    [
      checkIns,
      setCheckIns,
      getCheckIns,
      getCheckInsLoading,
      setGetCheckInsLoading,
      getCheckInsError,
      setGetCheckInsError,
      createCheckIn,
      createCheckInLoading,
      setCreateCheckInLoading,
      createCheckInError,
      setCreateCheckInError,
      updateCheckIn,
      updateCheckInLoading,
      setUpdateCheckInLoading,
      updateCheckInError,
      setUpdateCheckInError,
      deleteCheckIn,
      deleteCheckInLoading,
      setDeleteCheckInLoading,
      deleteCheckInError,
      setDeleteCheckInError,
      recordCheckIn,
      recordCheckInLoading,
      setRecordCheckInLoading,
      recordCheckInError,
      setRecordCheckInError,
    ],
  );

  /**
   * @description when mounts, get checkIns
   */
  useEffect(() => {
    getCheckIns();
  }, [getCheckIns]);

  return (
    <CheckInsContext.Provider value={value}>
      {children}
    </CheckInsContext.Provider>
  );
};
