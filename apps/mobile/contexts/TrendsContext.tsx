import React, {
  useEffect,
  ReactNode,
  useState,
  useContext,
  createContext,
  SetStateAction,
  Dispatch,
} from 'react';
import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useIsFocused} from '@react-navigation/native';
import dayjs from 'dayjs';

import {GetResponse, SymptomTrendsResponse, TrendsResponse} from '@pathize/api';
import {useAppState, useInitTerra} from '../hooks';
import {useAuth} from '../CoreNav';
import {
  useTodayDataContext,
  useSymptomsContext,
  useTerraContext,
  useLimitContext,
} from './';
import {fetcher} from '../utils';
import {getTrendsTimeFrameIos} from '../features/trends';

export type Categories = 'Crashes' | 'Heart' | 'Activity' | 'Sleep' | 'Symptom';

export type Category = {id: string; category: Categories};

export type TrendsTimeFrame = '2 Weeks' | '1 Month';

type FilterItems = {
  id: string;
  name: string;
};

////
// CONTEXT
////

export type TrendsContext = {
  selectedFilterItems: FilterItems[];
  setSelectedFilterItems: Dispatch<SetStateAction<FilterItems[]>>;
  selectedFilterCategory: Category;
  setSelectedFilterCategory: Dispatch<SetStateAction<Category>>;
  selectedTimeFrame: TrendsTimeFrame;
  setSelectedTimeFrame: Dispatch<SetStateAction<TrendsTimeFrame>>;
};

const TrendsContext = createContext<TrendsContext | undefined>(undefined);

export const useTrendsContext = () => {
  const context = useContext(TrendsContext);
  if (context === undefined) {
    throw new Error('useTrendsContext must be used within a TrendsProvider');
  }

  return context;
};

export const TrendsProvider = ({children}: {children: ReactNode}) => {
  const [selectedFilterItems, setSelectedFilterItems] = useState<FilterItems[]>(
    [],
  );
  const [selectedFilterCategory, setSelectedFilterCategory] =
    useState<Category>({
      id: '0',
      category: 'Crashes',
    });
  const [selectedTimeFrame, setSelectedTimeFrame] =
    useState<TrendsTimeFrame>('2 Weeks');
  const {appStateVisible} = useAppState();

  useEffect(() => {
    const getFilterItemsFromAsyncStorage = async () => {
      const filterItems = (await AsyncStorage.getItem('filterItems')) as string;
      if (!filterItems) return;
      setSelectedFilterItems(JSON.parse(filterItems));
    };

    getFilterItemsFromAsyncStorage();
  }, []);

  useEffect(() => {
    if (appStateVisible.match(/inactive|background/)) {
      try {
        // remove duplicates (by ID) from selectedFilterItems
        const uniqueSelectedFilterItems = [
          ...new Map(selectedFilterItems.map(item => [item.id, item])).values(),
        ];
        AsyncStorage.setItem(
          'filterItems',
          JSON.stringify(uniqueSelectedFilterItems),
        );
      } catch (e) {
        console.log(e);
      }
    }
  }, [selectedFilterItems, appStateVisible]);

  return (
    <TrendsContext.Provider
      value={{
        selectedFilterItems,
        setSelectedFilterItems,
        selectedFilterCategory,
        setSelectedFilterCategory,
        selectedTimeFrame,
        setSelectedTimeFrame,
      }}>
      {children}
    </TrendsContext.Provider>
  );
};

////
// HOOKS
////

export const useSymptomRecordsTimeFrame = (daysToFetch: number) => {
  const {userId, accessToken} = useAuth();
  const {actuallyToday} = useTodayDataContext();
  const {symptomRecords} = useSymptomsContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [symptomRecordsTimeFrame, setSymptomRecordsTimeFrame] = useState<
    SymptomTrendsResponse[] | null
  >(null);

  useEffect(() => {
    const getSymptomRecordsTimeFrame = async () => {
      if (!userId || !accessToken) return;
      const endDate = dayjs(actuallyToday).format('YYYY-MM-DD');

      setLoading(true);

      try {
        const response: GetResponse<SymptomTrendsResponse> = await fetcher(
          `api/v1/getSymptomTrendsTimeFrame?userId=${userId}&endDate=${endDate}&daysToFetch=${daysToFetch}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        // error checking
        if (
          response.status === 404 ||
          response.status === 500 ||
          response.status === 403
        ) {
          setSymptomRecordsTimeFrame(null);
          return null;
        }
        if (!Array.isArray(response.data)) {
          setSymptomRecordsTimeFrame(null);
          return null;
        }

        setSymptomRecordsTimeFrame(response.data);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };

    getSymptomRecordsTimeFrame();
  }, [symptomRecords, actuallyToday, userId, accessToken, daysToFetch]);

  return {symptomRecordsTimeFrame, loading, error};
};

const shouldUpdateBool = (timeUpdated: Date, timeConnected: Date): boolean => {
  const timeUpdatedDayjs = dayjs(timeUpdated);
  const diff = dayjs().diff(timeUpdatedDayjs, 'minutes');
  const deviceRecentlyConnected = dayjs().diff(timeConnected, 'minute') < 10;
  if (diff >= 30) return true; // if it has been more than 30 mins, update
  if (deviceRecentlyConnected) return true; // if the device was recently connected, update
  return false;
};

export const useTrendsData = (daysToFetch: number) => {
  const {userId, accessToken} = useAuth();
  const {actuallyToday} = useTodayDataContext();
  const {terraDevice} = useTerraContext();
  const {limit} = useLimitContext();
  const {initStatus} = useInitTerra();
  const [timeUpdated, setTimeUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [trendsData, setTrendsData] = useState<TrendsResponse[] | null>(null);
  const [shouldUpdate, setShouldUpdate] = useState<boolean>(true);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!terraDevice || !isFocused || !initStatus) return;
    if (!timeUpdated) {
      setShouldUpdate(true);
      return;
    }
    const shouldTimeUpdate =
      timeUpdated && shouldUpdateBool(timeUpdated, terraDevice.createdAt);
    setShouldUpdate(shouldTimeUpdate);
  }, [trendsData, timeUpdated, terraDevice, isFocused, initStatus]);

  useEffect(() => {
    const getTrendsData = async () => {
      if (!terraDevice) {
        setTrendsData(null);
        setTimeUpdated(null);
        setShouldUpdate(false);
        return;
      }
      if (!userId || !accessToken) return;
      const endDate = dayjs(actuallyToday).format('YYYY-MM-DD');
      const tomorrow = dayjs(actuallyToday).add(1, 'day').format();
      const timeAgo = dayjs(tomorrow).subtract(daysToFetch, 'days').format();

      setLoading(true);

      if (Platform.OS === 'ios' && terraDevice?.resource === 'APPLE') {
        const response = await getTrendsTimeFrameIos(
          userId,
          timeAgo,
          tomorrow,
          limit!,
          30,
        );

        // protect against empty response
        if (!response || (Array.isArray(response) && response.length === 0)) {
          setLoading(false);
          setTrendsData(null);
          return;
        }

        if (response === 'Unauthenticated') {
          setTimeout(() => {
            getTrendsData();
          }, 3000);
          return;
        }

        setLoading(false);
        setTrendsData(response);
        setTimeUpdated(dayjs().toDate());
      } else {
        try {
          const response: GetResponse<TrendsResponse> = await fetcher(
            `api/v1/getTrendsTimeFrame?userId=${userId}&limit=${limit!}&endDate=${endDate}&daysToFetch=${daysToFetch}&resource=${
              terraDevice.resource
            }`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
              },
            },
          );

          if (
            response.status === 404 ||
            response.status === 500 ||
            !response.data ||
            !Array.isArray(response.data)
          ) {
            setLoading(false);
            setTrendsData(null);
            return;
          }

          setLoading(false);
          setTrendsData(response.data);
          setTimeUpdated(dayjs().toDate());
        } catch (err) {
          setTrendsData(null);
          setError('There was an error fetching data from the server.');
          setTimeout(() => setError(null), 5000);
          return null;
        } finally {
          setLoading(false);
        }
      }
    };

    if (!isFocused || !shouldUpdate || !limit) return;

    getTrendsData();
  }, [
    actuallyToday,
    shouldUpdate,
    userId,
    terraDevice,
    accessToken,
    daysToFetch,
    isFocused,
    limit,
  ]);

  return {trendsData, timeUpdated, shouldUpdate, loading, error};
};
