import React, {
  useContext,
  useState,
  SetStateAction,
  Dispatch,
  useEffect,
  createContext,
} from 'react';
import {HeartRateDataSample} from 'terra-api/lib/cjs/models/samples/HeartRateDataSample';
import dayjs from 'dayjs';

import {useAppState} from '../hooks';

export type Metadata = {
  timeAboveLimit: number;
  maxHr: number;
  minHr: number;
  restingHr: number | null;
  hrv: number | null;
  heartRateSamples?: HeartRateDataSample[] | undefined;
} | null;

export type DataTodayContext = {
  // TODAY'S DATE, AND THE DATE SELECTED BY THE USER
  actuallyToday: string;
  setActuallyToday: Dispatch<SetStateAction<string>>;
  today: string;
  setToday: Dispatch<SetStateAction<string>>;
  // SELECTED BY DAY PICKER SHEET
  selectedId: string;
  setSelectedId: Dispatch<SetStateAction<string>>;
};

const DataTodayContext = createContext<DataTodayContext | undefined>(undefined);

export const useTodayDataContext = () => {
  const context = useContext(DataTodayContext);
  if (context === undefined) {
    throw new Error(
      'useTodayDataContext must be used within a TodayDataProvider',
    );
  }
  return context;
};

export const TodayDataProvider = ({children}: {children: React.ReactNode}) => {
  const {appStateVisible} = useAppState();

  const [actuallyToday, setActuallyToday] = useState<string>(
    dayjs().format('YYYY-MM-DD'),
  );
  const [selectedId, setSelectedId] = useState('0');
  const [today, setToday] = useState<string>(dayjs().format('YYYY-MM-DD'));

  /**
   * @description - when app is active, make sure that the current day is selected
   */
  useEffect(() => {
    if (appStateVisible === 'active') {
      const checkActuallyToday = dayjs().format('YYYY-MM-DD');
      if (checkActuallyToday !== actuallyToday) {
        setActuallyToday(checkActuallyToday);
      }
    }
  }, [appStateVisible, actuallyToday]);

  return (
    <DataTodayContext.Provider
      value={{
        // HEART RATE DATA TO BE RENDERED ON HOME SCREEN
        actuallyToday,
        setActuallyToday,
        today,
        setToday,
        selectedId,
        setSelectedId,
      }}>
      {children}
    </DataTodayContext.Provider>
  );
};
