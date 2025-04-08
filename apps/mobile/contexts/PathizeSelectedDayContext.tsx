import React, {
  Dispatch,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import {Daily} from 'terra-api/lib/cjs/models/Daily';
import {Sleep} from 'terra-api/lib/cjs/models/Sleep';

import {useAppState, useInitTerra} from '../hooks';
import {
  PathizeMetadata,
  useLimitContext,
  usePathizeDataContext,
  useTerraContext,
  useTodayDataContext,
} from './';
import {getDailyData, getSleepData} from '../services/data';
import {useAuth} from '../CoreNav';
import {oneButtonAlert, extractMetadata} from '../lib';

type PathizeSelectedDayStatePayload =
  | 'SET_LOADING'
  | 'SET_ERROR'
  | 'SET_DATA'
  | 'RESET';

type PathizeSelectedDayState = {
  currentState: PathizeSelectedDayStatePayload;
  date?: string;
  loading: boolean;
  error: boolean;
  metadata?: PathizeMetadata;
  lastUpdated?: string;
  // initialized means that we are opening from a closed state
  initialized?: boolean;
};

type PathizeSelectedDayActionPayload = Partial<
  Omit<PathizeSelectedDayState, 'currentState'>
>;

type PathizeSelectedDayAction = {
  type: PathizeSelectedDayStatePayload;
  payload: PathizeSelectedDayActionPayload;
};

const initialState: PathizeSelectedDayState = {
  currentState: 'RESET',
  date: undefined,
  loading: false,
  error: false,
  metadata: undefined,
  lastUpdated: undefined,
  initialized: false,
};

const reducer = (
  prevState: PathizeSelectedDayState,
  action: PathizeSelectedDayAction,
): PathizeSelectedDayState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...prevState,
        currentState: 'SET_LOADING',
        loading: true,
        error: false,
        ...action.payload,
      };
    case 'SET_ERROR':
      return {
        ...prevState,
        currentState: 'SET_ERROR',
        lastUpdated: undefined,
        loading: false,
        error: true,
        ...action.payload,
      };
    case 'SET_DATA':
      return {
        ...prevState,
        currentState: 'SET_DATA',
        loading: false,
        error: false,
        initialized: true,
        ...action.payload,
      };
    case 'RESET':
      return initialState;
    default:
      return prevState;
  }
};

export type PathizeSelectedDayContext = {
  state: PathizeSelectedDayState;
  dispatch: Dispatch<PathizeSelectedDayAction>;
  // FUNCTIONS
  updatePathizeSelectedDay: (
    date: string,
    limit: number,
    shouldUpdateLoading?: boolean,
  ) => Promise<void>;
};

const PathizeSelectedDayContext = createContext<
  PathizeSelectedDayContext | undefined
>(undefined);

export const usePathizeSelectedDayContext = () => {
  const context = useContext(PathizeSelectedDayContext);
  if (context === undefined) {
    throw new Error(
      'usePathizeSelectedDayContext must be used within a PathizeSelectedDayContextProvider',
    );
  }

  return context;
};

export const PathizeSelectedDayContextProvider: React.FC<{
  children: ReactNode;
}> = ({children}) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    state: {data},
    dispatch: pathizeDataDispatch,
  } = usePathizeDataContext();
  const {terraDevice} = useTerraContext();
  const {limit} = useLimitContext();
  const {initStatus: isTerraInitialized} = useInitTerra();
  const {userId} = useAuth();
  const {appStateVisible} = useAppState();
  const {today, actuallyToday} = useTodayDataContext();

  /**
   * @description cached data for the currently selected day if defined
   */
  const [cachedPayloadForToday, setCachedPayloadForToday] = useState<
    | {
        initialized?: boolean | undefined;
        date: string;
        metadata: PathizeMetadata;
        lastUpdated: string | undefined;
        loading: boolean;
      }
    | undefined
  >(undefined);

  /**
   * @description update the data for the selected day selected day data
   */
  const updatePathizeSelectedDay = useCallback(
    async (
      date: string,
      heartRateLimit: number,
      shouldUpdateLoading = true,
    ) => {
      // Alert.alert('GETTING DATA FOR TODAY');
      // if already loading, leave early
      if (state.loading) {
        // set to false
        return;
      }

      if (shouldUpdateLoading) {
        dispatch({type: 'SET_LOADING', payload: {date, loading: true}});
      } else {
        dispatch({type: 'SET_LOADING', payload: {date, loading: false}});
      }

      const timeoutPromise = new Promise(resolve =>
        setTimeout(() => resolve(null), 10000),
      );
      try {
        const result = (await Promise.race([
          Promise.all([getDailyData(date), getSleepData(date)]),
          timeoutPromise,
        ])) as [Daily | null, Sleep | null] | null;

        // if result is null, it timed out, and we can leave early
        if (!result) {
          if (date === actuallyToday) {
            // if the date is current, set it to be the data cached
            dispatch({
              type: 'SET_DATA',
              payload: cachedPayloadForToday ?? {
                date,
                loading: false,
              },
            });
          } else {
            // set to null otherwise
            dispatch({
              type: 'SET_LOADING',
              payload: {
                date: date,
                loading: false,
                metadata: undefined,
              },
            });
          }
          return;
        }

        const [dailyData, sleepData] = result;
        if (!dailyData && !sleepData) {
          dispatch({
            type: 'SET_LOADING',
            payload: {
              date: date,
              loading: false,
              metadata: undefined,
            },
          });
          return;
        }

        const metadata = extractMetadata(
          dailyData ?? undefined,
          sleepData ?? undefined,
          heartRateLimit,
        );

        // entry for the current context
        const payload = {
          date,
          metadata,
          lastUpdated:
            metadata?.heartRateSamples && metadata?.heartRateSamples.length > 0
              ? metadata.heartRateSamples[metadata.heartRateSamples.length - 1]
                  ?.timestamp
              : undefined,
          loading: false,
        };

        // entry for the other context
        const updatePathizeDataDataPayload = {
          ...data, // Spread the existing data to keep other dates unchanged
          [date]: {
            // Update the specific date entry with new data
            date: date,
            metadata: metadata,
          },
        };

        if (date === actuallyToday) {
          setCachedPayloadForToday(payload);
        }

        dispatch({type: 'SET_DATA', payload});
        pathizeDataDispatch({
          type: 'SET_DATA',
          payload: {data: updatePathizeDataDataPayload},
        });
      } catch (err) {
        dispatch({type: 'SET_ERROR', payload: {date}});
        oneButtonAlert(
          'Issue getting data!',
          'There was an error loading your data. Please refresh by pulling down to try again.',
        );
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userId],
  );

  /**
   * @description useEffect that updates the selected day when it changes, or, when the app returns from foreground
   */
  useEffect(() => {
    if (!isTerraInitialized || !today || !terraDevice || !limit) return;

    const updateSelectedDay = async (showLoading: boolean) => {
      await updatePathizeSelectedDay(today, limit, showLoading); // if today, show loader
    };

    if (appStateVisible === 'active') {
      setTimeout(() => {
        console.log('🧮 UPDATING SELECTED DAY');
        updateSelectedDay(true);
      }, 200);
    }
  }, [
    appStateVisible,
    terraDevice,
    isTerraInitialized,
    limit,
    today,
    updatePathizeSelectedDay,
  ]);

  const value = useMemo(
    () => ({
      // STATE
      state,
      dispatch,
      // FUNCTIONS
      updatePathizeSelectedDay,
    }),
    [state, updatePathizeSelectedDay],
  );

  return (
    <PathizeSelectedDayContext.Provider value={value}>
      {children}
    </PathizeSelectedDayContext.Provider>
  );
};
