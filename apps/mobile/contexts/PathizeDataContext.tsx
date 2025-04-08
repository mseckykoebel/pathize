import React, {
  Dispatch,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import {HeartRateDataSample} from 'terra-api/lib/cjs/models/samples/HeartRateDataSample';
import {Daily} from 'terra-api/lib/cjs/models/Daily';
import {Sleep} from 'terra-api/lib/cjs/models/Sleep';
import dayjs from 'dayjs';

import {Crash} from '@pathize/db';
import {removeDuplicateCrashes} from '@pathize/lib';
import {useTodayDataContext} from './DataTodayContext';
import {getDailyDataTimeFrame, getSleepDataTimeFrame} from '../services/data';
import {useTerraContext, useLimitContext, useCrashesContext} from './';
import {extractMetadata, twoButtonAlert} from '../lib';
import {getEnergyBudgetStats} from './utils';
import {useAppState, useInitTerra} from '../hooks';

/**
 * Data Context
 * @description Context for data
 * @param {string} date - the date this data object is for, formatted as YYYY-MM-DD
 * @param {Daily} dailyData - the biometric/wearable data for this day
 * @param {Sleep} sleepData - the sleep data for this day
 * @param {PathizeMetadata} metadata - custom, pathize-specific metadata for this day, inc. time above limit
 */

export type PathizeMetadata = {
  timeAboveLimit: number;
  maxHr?: number;
  minHr?: number;
  restingHr?: number;
  hrv?: number;
  timeStanding?: number;
  timeInDeepSleep?: number;
  timeInREMSleep?: number;
  nighttimeHrv?: number;
  steps?: number;
  // raw data
  heartRateSamples?: HeartRateDataSample[] | undefined;
};

export type PathizeData = {
  date: string;
  metadata?: PathizeMetadata;
};

export type PathizeDataMap = {
  [date: string]: PathizeData;
};

type PathizeDataStatePayload =
  | 'SET_LOADING'
  | 'SET_ERROR'
  | 'SET_DATA'
  | 'RESET';

export type PathizeExertionGuidance = {
  // recommended TOL
  exertionGuidanceTimeAboveLimit?: number;
  // other related metrics
  maxHrDuringPEMUpperBound?: number;
  maxHrDuringPEMLowerBound?: number;
  maxHrDuringPEM?: number;
  minHrDuringPEMUpperBound?: number;
  minHrDuringPEMLowerBound?: number;
  minHrDuringPEM?: number;
  restingHrDuringPEMUpperBound?: number;
  restingHrDuringPEMLowerBound?: number;
  restingHrDuringPEM?: number;
  hrvDuringPEMUpperBound?: number;
  hrvDuringPEMLowerBound?: number;
  hrvDuringPEM?: number;
  timeStandingDuringPEMUpperBound?: number;
  timeStandingDuringPEMLowerBound?: number;
  timeStandingDuringPEM?: number;
  timeInDeepSleepDuringPEMUpperBound?: number;
  timeInDeepSleepDuringPEMLowerBound?: number;
  timeInDeepSleepDuringPEM?: number;
  timeInREMSleepDuringPEMUpperBound?: number;
  timeInREMSleepDuringPEMLowerBound?: number;
  timeInREMSleepDuringPEM?: number;
  nighttimeHrvDuringPEMUpperBound?: number;
  nighttimeHrvDuringPEMLowerBound?: number;
  nighttimeHrvDuringPEM?: number;
  stepsDuringPEMUpperBound?: number;
  stepsDuringPEMLowerBound?: number;
  stepsDuringPEM?: number;
};

type PathizeDataState = {
  currentState: PathizeDataStatePayload;
  loading: boolean;
  error: boolean;
  initialized: boolean;
  data?: PathizeDataMap; // entire data store
  energyBudgetData?: PathizeExertionGuidance; // current day's data
};

// type for the new payload
export type PathizeDataActionPayload = Partial<
  Omit<PathizeDataState, 'currentState'>
>;

type PathizeDataAction = {
  type: PathizeDataStatePayload;
  payload: PathizeDataActionPayload;
};

const initialState: PathizeDataState = {
  currentState: 'RESET',
  loading: false,
  error: false,
  initialized: false,
  data: undefined,
  energyBudgetData: undefined,
};

const reducer = (
  prevState: PathizeDataState,
  action: PathizeDataAction,
): PathizeDataState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...prevState,
        ...action.payload,
        currentState: action.type,
      };
    case 'SET_ERROR':
      return {
        ...prevState,
        ...action.payload,
        currentState: action.type,
      };
    case 'SET_DATA':
      const {data, ...restOfPayload} = action.payload;
      return {
        ...prevState,
        data: {
          ...prevState.data,
          ...data,
        },
        currentState: action.type,
        loading: false,
        error: false,
        ...restOfPayload,
      };
    case 'RESET':
      return {
        ...prevState,
        currentState: action.type,
        loading: false,
        error: false,
        data: undefined,
        energyBudgetData: undefined,
      };
    default:
      return prevState;
  }
};

export type PathizeDataContext = {
  // STATE
  state: PathizeDataState;
  dispatch: Dispatch<PathizeDataAction>;
  // FUNCTIONS
  updatePathizeDataMultipleDays: (
    startDate: string,
    endDate: string,
    heartRateLimit: number,
    allCrashes: Crash[],
    shouldInitialize: boolean,
  ) => Promise<void>;
};

export const usePathizeDataContext = () => {
  const context = useContext(PathizeDataContext);
  if (context === undefined) {
    throw new Error(
      'usePathizeDataContext must be used within a PathizeDataProvider',
    );
  }
  return context;
};

////
// HELPER FUNCTIONS
////

const PathizeDataContext = createContext<PathizeDataContext | undefined>(
  undefined,
);

export const PathizeDataProvider = ({children}: {children: ReactNode}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const {appStateVisible} = useAppState();
  const {limit} = useLimitContext();
  const {initStatus: isTerraInitialized} = useInitTerra();
  const {terraDevice} = useTerraContext();
  const {allCrashes} = useCrashesContext();
  const {actuallyToday} = useTodayDataContext();

  /**
   * @description fetches and sets data for multiple days
   */
  const updatePathizeDataMultipleDays = useCallback(
    async (
      startDate: string,
      endDate: string,
      heartRateLimit: number,
      allRecordedCrashes: Crash[],
      shouldInitialize: boolean,
    ) => {
      dispatch({
        type: 'SET_LOADING',
        payload: {
          loading: true,
          error: false,
        },
      });

      const timeoutPromise = new Promise(resolve =>
        setTimeout(() => resolve(null), 10000),
      );
      try {
        const result = (await Promise.race([
          Promise.all([
            getDailyDataTimeFrame(startDate, endDate),
            getSleepDataTimeFrame(startDate, endDate),
          ]),
          timeoutPromise,
        ])) as [Daily[] | null, Sleep[] | null] | null;

        if (!result) {
          console.log('HISTORICAL DATA TIMEOUT');
          dispatch({
            type: 'SET_ERROR',
            payload: {
              loading: false,
              error: true,
              data: undefined,
              energyBudgetData: undefined,
            },
          });

          twoButtonAlert(
            'Energy budget timed out',
            'Loading your energy budget took too long - probably due to intermittent service. Press re-try to attempt to re-load.',
            'Ok',
            'Retry',
            async () => {
              // if it failed, just try and re-fresh it silently
              if (!limit || !allCrashes) return;
              return await updatePathizeDataMultipleDays(
                startDate,
                actuallyToday,
                limit,
                allCrashes,
                shouldInitialize,
              );
            },
          );

          return;
        }

        const [dailyData, sleepData] = result;

        if (!dailyData && !sleepData) {
          console.log('⚠️ DAILY DATA OR SLEEP DATA UNAVAILABLE');
          dispatch({
            type: 'SET_LOADING',
            payload: {
              loading: false,
              error: false,
            },
          });
          return;
        }

        // Create a combined map of daily and sleep data keyed by the formatted date
        const combinedDataMap = new Map<
          string,
          {daily?: Daily; sleep?: Sleep}
        >();

        // loop through daily data and add to map
        dailyData?.forEach(data => {
          const date = dayjs(data.metadata.start_time).format('YYYY-MM-DD');
          const existingEntry = combinedDataMap.get(date) || {};
          combinedDataMap.set(date, {...existingEntry, daily: data});
        });

        // loop through sleep data and add to map
        sleepData?.forEach(data => {
          const date = dayjs(data.metadata.start_time).format('YYYY-MM-DD');
          const existingEntry = combinedDataMap.get(date) || {};
          combinedDataMap.set(date, {...existingEntry, sleep: data});
        });

        // construct the daily sleep structure
        const dailySleepStructure = Array.from(
          combinedDataMap,
          ([date, {daily, sleep}]) => {
            const metadata = extractMetadata(daily, sleep, heartRateLimit);
            return {date, metadata};
          },
        ).reduce(
          (acc, {date, metadata}) => {
            acc[date] = {date, metadata};
            return acc;
          },
          {} as {[date: string]: {date: string; metadata?: PathizeMetadata}},
        );

        const exertionGuidanceStats = getEnergyBudgetStats(
          allRecordedCrashes,
          dailySleepStructure,
          heartRateLimit,
        );

        dispatch({
          type: 'SET_DATA',
          payload: {
            loading: false,
            error: false,
            data: dailySleepStructure,
            energyBudgetData: exertionGuidanceStats,
            ...(!shouldInitialize && {initialized: true}),
          },
        });

        /**
         * TODO: uncomment when ready for notifications
         * // finally, save the newly calculated data to the backend if it exists
        if (
          exertionGuidanceStats.exertionGuidanceTimeAboveLimit !== undefined
        ) {
          await updateEnergyBudget(
            exertionGuidanceStats.exertionGuidanceTimeAboveLimit,
          );
        } else {
          console.log('⚠️ EXERTION GUIDANCE TIME ABOVE LIMIT UNDEFINED');
        }
         */
      } catch (err) {
        dispatch({
          type: 'SET_ERROR',
          payload: {
            loading: false,
            error: true,
            data: undefined,
            energyBudgetData: undefined,
          },
        });

        twoButtonAlert(
          'Issue getting energy budget!',
          'There was an error loading your data. Press retry to attempt to re-load your data.',
          'Ok',
          'Retry',
          async () => {
            // if it failed, just try and re-fresh it silently
            if (!limit || !allCrashes) return;
            return await updatePathizeDataMultipleDays(
              startDate,
              actuallyToday,
              limit,
              allCrashes,
              shouldInitialize,
            );
          },
        );
      }
    },
    [actuallyToday, allCrashes, limit],
  );

  const refreshDataContext = useCallback(
    async (shouldInitialize: boolean) => {
      if (!limit || !allCrashes) return;

      console.log('🚀 ~ allCrashes', allCrashes);
      const startDate = dayjs(actuallyToday)
        .subtract(29, 'days')
        .format('YYYY-MM-DD');
      return await updatePathizeDataMultipleDays(
        startDate,
        actuallyToday,
        limit,
        allCrashes,
        shouldInitialize,
      );
    },
    [actuallyToday, allCrashes, limit, updatePathizeDataMultipleDays],
  );

  /**
   * @description effect for when the app first opens; handle initialization
   */
  useEffect(() => {
    if (!terraDevice || !isTerraInitialized || !limit || !allCrashes) return;

    const filteredCrashes = allCrashes.filter(crash =>
      dayjs(crash.createdDay).isAfter(dayjs().subtract(30, 'day')),
    );
    const crashesInLastThirtyDays =
      removeDuplicateCrashes(filteredCrashes).length;
    if (crashesInLastThirtyDays <= 2) {
      console.log('NOT ENOUGH CRASHES - NOT CALCULATING');
      return;
    }

    console.log('📊 INITIALIZING PATHIZE DATA CONTEXT');
    refreshDataContext(true);
  }, [
    actuallyToday,
    allCrashes,
    isTerraInitialized,
    terraDevice,
    limit,
    updatePathizeDataMultipleDays,
    refreshDataContext,
  ]);

  /**
   * @description handle subsequent checks
   * data is re-freshed if the app is in the foreground,
   * data is unavailable, and we have initialized already
   */
  useEffect(() => {
    if (
      state.loading ||
      state.energyBudgetData ||
      !state.initialized ||
      !isTerraInitialized
    ) {
      return;
    }

    console.log('📊 REFRESHING PATHIZE DATA CONTEXT');
    refreshDataContext(false);
  }, [
    isTerraInitialized,
    appStateVisible,
    state.loading,
    state.energyBudgetData,
    state.initialized,
    refreshDataContext,
  ]);

  const value = useMemo(
    () => ({
      // STATE
      state,
      dispatch,
      // FUNCTIONS
      updatePathizeDataMultipleDays,
    }),
    [state, updatePathizeDataMultipleDays],
  );

  return (
    <PathizeDataContext.Provider value={value}>
      {children}
    </PathizeDataContext.Provider>
  );
};
