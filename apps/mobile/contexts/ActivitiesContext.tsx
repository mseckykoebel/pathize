import React, {
  ReactNode,
  useState,
  useContext,
  SetStateAction,
  Dispatch,
  useCallback,
} from 'react';
import {Platform} from 'react-native';
import {ActivityRecord, UserActivity} from '@pathize/db';
import {
  Activity,
  GetResponse,
  PatchResponse,
  PostResponse,
  SearchResponse,
} from '@pathize/api';
import {fetcher} from '../utils';
import {useAuth} from '../CoreNav';
import {useTodayDataContext} from '.';
import {useAnalytics} from '../hooks';
import {AWCManager} from 'awc-manager';

export type ActivitiesContext = {
  getUserActivities: () => Promise<void>;
  // user activities
  userActivities: UserActivity[] | null;
  setUserActivities: Dispatch<SetStateAction<UserActivity[] | null>>;
  userActivitiesLoading: boolean;
  setUserActivitiesLoading: Dispatch<SetStateAction<boolean>>;
  userActivitiesError: string | null;
  setUserActivitiesError: Dispatch<SetStateAction<string | null>>;
  // activity records
  // search activities from db
  searchAllActivities: (query: string) => Promise<void>;
  activitiesFromSearch: Activity[] | null;
  setActivitiesFromSearch: Dispatch<SetStateAction<Activity[] | null>>;
  activitySearchLoading: boolean;
  setActivitySearchLoading: Dispatch<SetStateAction<boolean>>;
  activitySearchError: string | null;
  setActivitySearchError: Dispatch<SetStateAction<string | null>>;
  // create user activity function, loading, and error
  createUserActivity: (
    activityId: string | null | undefined,
    activityName: string,
    activityPriority: number | null | undefined,
    activityIcon: string,
    activityNotes: string,
  ) => Promise<void>;
  createUserActivityLoading: boolean;
  setCreateUserActivityLoading: Dispatch<SetStateAction<boolean>>;
  createUserActivityError: string | null;
  setCreateUserActivityError: Dispatch<SetStateAction<string | null>>;
  // update user activity function, loading, and error
  updateUserActivity: (
    id: string,
    activityId: string | null | undefined,
    activityIcon: string,
    activityName: string,
    activityPriority: number | null | undefined,
    notes: string,
  ) => Promise<void>;
  updateUserActivityLoading: boolean;
  setUpdateUserActivityLoading: Dispatch<SetStateAction<boolean>>;
  updateUserActivityError: string | null;
  setUpdateUserActivityError: Dispatch<SetStateAction<string | null>>;
  // delete user activity
  deleteUserActivity: (id: string) => Promise<void>;
  deleteUserActivityLoading: boolean;
  setDeleteUserActivityLoading: Dispatch<SetStateAction<boolean>>;
  deleteUserActivityError: string | null;
  setDeleteUserActivityError: Dispatch<SetStateAction<string | null>>;
  ////
  // RECORDS
  ////
  getActivityRecords: () => Promise<void>;
  activityRecords: ActivityRecord[] | null;
  setActivityRecords: Dispatch<SetStateAction<ActivityRecord[] | null>>;
  activityRecordsLoading: boolean;
  setActivityRecordsLoading: Dispatch<SetStateAction<boolean>>;
  activityRecordsError: string | null;
  setActivityRecordsError: Dispatch<SetStateAction<string | null>>;
  // create activity record
  createActivityRecord: (
    time: Date,
    userActivityId: string,
    activityName: string,
    activityPriority: number | null,
    activityIcon: string,
    activityTotalTime: number,
  ) => Promise<void>;
  createActivityRecordLoading: boolean;
  setCreateActivityRecordLoading: Dispatch<SetStateAction<boolean>>;
  createActivityRecordError: string | null;
  setCreateActivityRecordError: Dispatch<SetStateAction<string | null>>;
  // update activity record
  updateActivityRecord: (
    id: string,
    activityTotalTime: number,
    time: Date,
  ) => Promise<void>;
  updateActivityRecordLoading: boolean;
  setUpdateActivityRecordLoading: Dispatch<SetStateAction<boolean>>;
  updateActivityRecordError: string | null;
  setUpdateActivityRecordError: Dispatch<SetStateAction<string | null>>;
  // delete activity record
  deleteActivityRecord: (id: string) => Promise<void>;
  deleteActivityRecordLoading: boolean;
  setDeleteActivityRecordLoading: Dispatch<SetStateAction<boolean>>;
  deleteActivityRecordError: string | null;
  setDeleteActivityRecordError: Dispatch<SetStateAction<string | null>>;
};

const ActivitiesContext = React.createContext<ActivitiesContext | undefined>(
  undefined,
);

export const useActivitiesContext = () => {
  const context = useContext(ActivitiesContext);
  if (context === undefined) {
    throw new Error(
      'useActivitiesContext must be used within a ActivitiesProvider',
    );
  }

  return context;
};

export const ActivitiesProvider = ({children}: {children: ReactNode}) => {
  const {userId, accessToken} = useAuth();
  const {recordEvent} = useAnalytics();
  const {today} = useTodayDataContext();

  // AWC manager helper function
  const isAWFullyAvailable = async () => {
    const isAWPaired = await AWCManager?.isPaired();
    const isAWCSupported = await AWCManager?.isWCSupported();
    const isAWAInstalled = await AWCManager?.isWatchAppInstalled();
    const isIOs = Platform.OS === 'ios';
    return (
      Boolean(isAWPaired) &&
      Boolean(isAWCSupported) &&
      Boolean(isAWAInstalled) &&
      isIOs
    );
  };

  const sendMessage = (
    message:
      | {
          [key: string]: Record<string, string | unknown> | string;
        }
      | string
      | null,
  ) => {
    return AWCManager?.sendMessage(message);
  };

  const [userActivities, setUserActivities] = useState<UserActivity[] | null>(
    null,
  );
  const [userActivitiesLoading, setUserActivitiesLoading] = useState(false);
  const [userActivitiesError, setUserActivitiesError] = useState<string | null>(
    null,
  );

  /**
   * @description get activities associated with a user. re-create each time called.
   */
  const getUserActivities = useCallback(async () => {
    setUserActivitiesLoading(true);
    try {
      const activitiesResponse: GetResponse<UserActivity> = await fetcher(
        `api/v1/getUserActivities?userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (activitiesResponse.status !== 200) {
        setUserActivities(null);
      } else {
        const activities = activitiesResponse.data as UserActivity[];
        setUserActivities(activities);
      }
    } catch (err) {
      setUserActivitiesError(
        'We ran into a problem getting your activities. Please try again in a few minutes',
      );
    } finally {
      setUserActivitiesLoading(false);
      setTimeout(() => setUserActivitiesError(null), 50);
    }
  }, [accessToken, userId]);

  // searching loading and error state
  const [activitiesFromSearch, setActivitiesFromSearch] = useState<
    Activity[] | null
  >(null);
  const [activitySearchLoading, setActivitySearchLoading] = useState(false);
  const [activitySearchError, setActivitySearchError] = useState<string | null>(
    null,
  );

  /**
   * @description searches our database for activities
   */
  const searchAllActivities = useCallback(
    async (query: string) => {
      setActivitySearchLoading(true);
      try {
        const allActivities: SearchResponse<Activity> = await fetcher(
          `api/v1/searchActivitiesFromDb?query=${query}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        if (
          allActivities.status !== 200 ||
          !Array.isArray(allActivities.data)
        ) {
          setActivitySearchError('No activities found');
        } else {
          setActivitiesFromSearch(allActivities.data);
        }
      } catch (err) {
        setActivitySearchError('No activities found');
      } finally {
        setActivitySearchLoading(false);
        setActivitySearchError(null);
      }
    },
    [accessToken],
  );

  // create user activity loading and error state
  const [createUserActivityLoading, setCreateUserActivityLoading] =
    useState(false);
  const [createUserActivityError, setCreateUserActivityError] = useState<
    string | null
  >(null);

  /**
   * @description creates a brand new user activity
   */
  const createUserActivity = async (
    activityId: string | null | undefined,
    activityName: string,
    activityPriority: number | null | undefined,
    activityIcon: string,
    activityNotes: string,
  ) => {
    const responseBody = JSON.stringify({
      userId: userId,
      activityId: activityId,
      activityName: activityName,
      activityPriority: activityPriority,
      activityIcon: activityIcon,
      notes: activityNotes,
    });

    setCreateUserActivityLoading(true);
    try {
      const response: PostResponse<UserActivity> = await fetcher(
        'api/v1/createUserActivity',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: responseBody,
        },
      );

      // name exists already
      if (response.status === 400) {
        setCreateUserActivityError('Activity name already exists');
      } else {
        if (await isAWFullyAvailable()) {
          sendMessage({activities: 'activities'});
        }

        recordEvent('User Activity', 'Created', {
          $screen_name: 'NewUserActivityConfirm',
        });
      }

      getUserActivities(); // re-load user activities
    } catch (err) {
      setCreateUserActivityError(
        'There was an issue saving this activity. Please try again later.',
      );
    } finally {
      setCreateUserActivityLoading(false);
      setTimeout(() => setCreateUserActivityError(null), 50);
    }
  };

  const [updateUserActivityLoading, setUpdateUserActivityLoading] =
    useState(false);
  const [updateUserActivityError, setUpdateUserActivityError] = useState<
    string | null
  >(null);

  /**
   * @description update a user activity
   */
  const updateUserActivity = async (
    id: string,
    activityId: string | null | undefined,
    activityIcon: string,
    activityName: string,
    activityPriority: number | null | undefined,
    notes: string,
  ) => {
    const responseBody = JSON.stringify({
      id: id,
      activityId: activityId,
      activityIcon: activityIcon,
      activityName: activityName,
      activityPriority: activityPriority,
      notes: notes,
    });

    setUpdateUserActivityLoading(true);
    try {
      const response: PatchResponse<UserActivity> = await fetcher(
        'api/v1/updateUserActivity',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: responseBody,
        },
      );

      if (response.status === 200) {
        recordEvent('User Activity', 'Updated', {
          $screen_name: 'EditUserActivity',
        });
        if (await isAWFullyAvailable()) {
          sendMessage({activities: 'activities'});
        }
        getUserActivities(); // re-load user activities on successful edit
      } else {
        setUpdateUserActivityError(
          'There was an issue saving this activity. Please try again later.',
        );
      }
    } catch (err) {
      setUpdateUserActivityError(
        'There was an issue saving this activity. Please try again later.',
      );
    } finally {
      setUpdateUserActivityLoading(false);
      setTimeout(() => setUpdateUserActivityError(null), 50);
    }
  };

  const [deleteUserActivityLoading, setDeleteUserActivityLoading] =
    useState(false);
  const [deleteUserActivityError, setDeleteUserActivityError] = useState<
    string | null
  >(null);

  /**
   * @description delete a user activity
   */
  const deleteUserActivity = async (id: string) => {
    setDeleteUserActivityLoading(true);
    try {
      await fetcher(`api/v1/deleteUserActivity?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      recordEvent('User Activity', 'Deleted', {
        $screen_name: 'EditUserActivity',
      });

      if (await isAWFullyAvailable()) {
        sendMessage({activities: 'activities'});
      }

      await getUserActivities(); // re-load user activities on successful edit
    } catch (err) {
      setDeleteUserActivityError(
        'There was an issue deleting this activity. Please try again later.',
      );
    } finally {
      setDeleteUserActivityLoading(false);
      setTimeout(() => setDeleteUserActivityError(null), 50);
    }
  };

  ////
  // RECORDS
  ////
  const [activityRecords, setActivityRecords] = useState<
    ActivityRecord[] | null
  >(null);
  const [activityRecordsLoading, setActivityRecordsLoading] = useState(false);
  const [activityRecordsError, setActivityRecordsError] = useState<
    string | null
  >(null);

  /**
   * @description get activity records for a user. re-create only when there is a new day.
   */
  const getActivityRecords = useCallback(async () => {
    setActivityRecordsLoading(true);
    try {
      const response: GetResponse<ActivityRecord> = await fetcher(
        `api/v1/getActivityRecords?userId=${userId}&day=${today}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (response.message) {
        setActivityRecords(null);
      } else {
        setActivityRecords(
          (response.data! as ActivityRecord[]).sort((a, b) => {
            return a.time > b.time ? 1 : -1;
          }),
        );
      }
    } catch (error) {
      setActivityRecordsError(
        'There was an issue getting your records. Please try again in a few minutes.',
      );
    } finally {
      setActivityRecordsLoading(false);
      setTimeout(() => setActivityRecordsError(null), 50);
    }
  }, [accessToken, today, userId]);

  const [createActivityRecordLoading, setCreateActivityRecordLoading] =
    useState(false);
  const [createActivityRecordError, setCreateActivityRecordError] = useState<
    string | null
  >(null);

  /**
   * @description create a new activity record
   */
  const createActivityRecord = useCallback(
    async (
      time: Date,
      userActivityId: string,
      activityName: string,
      activityPriority: number | null,
      activityIcon: string,
      activityTotalTime: number,
    ) => {
      const responseBody = JSON.stringify({
        userId: userId,
        time: time,
        createdDay: today,
        userActivityId: userActivityId,
        activityName: activityName,
        activityPriority: activityPriority,
        activityIcon: activityIcon,
        activityTotalTime: activityTotalTime,
        platform: 'iphone',
      });

      setCreateActivityRecordLoading(true);
      try {
        await fetcher('api/v1/createActivityRecord', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: responseBody,
        });

        recordEvent('Activity Record', 'Created', {
          $screen_name: 'ConfirmNewActivityRecord',
          platform: 'iphone',
        });

        await getActivityRecords();
      } catch (err) {
        setCreateUserActivityError(
          ' There was an error creating this activity. Please try again in a few minutes',
        );
      } finally {
        setCreateActivityRecordLoading(false);
        setTimeout(() => setCreateUserActivityError(null), 50);
      }
    },
    [accessToken, getActivityRecords, today, userId, recordEvent],
  );

  const [updateActivityRecordLoading, setUpdateActivityRecordLoading] =
    useState(false);
  const [updateActivityRecordError, setUpdateActivityRecordError] = useState<
    string | null
  >(null);

  /**
   * @description update a single activity record
   */
  const updateActivityRecord = useCallback(
    async (id: string, activityTotalTime: number, time: Date) => {
      const responseBody = JSON.stringify({
        id: id,
        activityTotalTime: activityTotalTime,
        time: time,
      });
      setUpdateActivityRecordLoading(true);
      try {
        const response: PatchResponse<ActivityRecord> = await fetcher(
          'api/v1/updateActivityRecord',
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: responseBody,
          },
        );

        if (response.status === 200) {
          recordEvent('Activity Record', 'Updated', {
            $screen_name: 'EditActivityRecord',
          });
          getActivityRecords();
        }
      } catch (err) {
        setUpdateActivityRecordError(
          'There was an issue updating this activity record, please try again in a few minutes',
        );
      } finally {
        setUpdateActivityRecordLoading(false);
        setTimeout(() => setUpdateUserActivityError(null), 50);
      }
    },
    [accessToken, getActivityRecords, recordEvent],
  );

  const [deleteActivityRecordLoading, setDeleteActivityRecordLoading] =
    useState(false);
  const [deleteActivityRecordError, setDeleteActivityRecordError] = useState<
    string | null
  >(null);

  /**
   * @description delete a user activity record
   */
  const deleteActivityRecord = useCallback(
    async (id: string) => {
      setDeleteActivityRecordLoading(true);
      try {
        await fetcher(`api/v1/deleteActivityRecord?id=${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        recordEvent('Activity Record', 'Deleted', {
          $screen_name: 'EditActivityRecord',
        });

        getActivityRecords();
      } catch (err) {
        setDeleteActivityRecordError(
          'There was an issue deleting this activity record, please try again in a few minutes',
        );
      } finally {
        setDeleteActivityRecordLoading(false);
        setTimeout(() => setDeleteActivityRecordError(null), 50);
      }
    },
    [accessToken, getActivityRecords, recordEvent],
  );

  return (
    <ActivitiesContext.Provider
      value={{
        userActivities,
        getUserActivities,
        setUserActivities,
        userActivitiesLoading,
        setUserActivitiesLoading,
        userActivitiesError,
        setUserActivitiesError,
        // searching activities
        searchAllActivities,
        activitiesFromSearch,
        setActivitiesFromSearch,
        activitySearchLoading,
        setActivitySearchLoading,
        activitySearchError,
        setActivitySearchError,
        // create user activity function, loading, and error
        createUserActivity,
        createUserActivityLoading,
        setCreateUserActivityLoading,
        createUserActivityError,
        setCreateUserActivityError,
        // update user activity function, loading, and error
        updateUserActivity,
        updateUserActivityLoading,
        setUpdateUserActivityLoading,
        updateUserActivityError,
        setUpdateUserActivityError,
        // delete user activity
        deleteUserActivity,
        deleteUserActivityLoading,
        setDeleteUserActivityLoading,
        deleteUserActivityError,
        setDeleteUserActivityError,
        ////
        // RECORDS
        ////
        activityRecords,
        getActivityRecords,
        setActivityRecords,
        activityRecordsLoading,
        setActivityRecordsLoading,
        activityRecordsError,
        setActivityRecordsError,
        // create activity record
        createActivityRecord,
        createActivityRecordLoading,
        setCreateActivityRecordLoading,
        createActivityRecordError,
        setCreateActivityRecordError,
        // update activity record
        updateActivityRecord,
        updateActivityRecordLoading,
        setUpdateActivityRecordLoading,
        updateActivityRecordError,
        setUpdateActivityRecordError,
        // delete activity record
        deleteActivityRecord,
        deleteActivityRecordLoading,
        setDeleteActivityRecordLoading,
        deleteActivityRecordError,
        setDeleteActivityRecordError,
      }}>
      {children}
    </ActivitiesContext.Provider>
  );
};
