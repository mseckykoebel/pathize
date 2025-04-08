import React, {
  ReactNode,
  useState,
  useContext,
  createContext,
  SetStateAction,
  Dispatch,
  useEffect,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type MultiSelectListItem = {
  id: string;
  name: string;
};

/**
 * @description OverlayContext mostly contains boolean flags. These flags are used in the app to control the visibility of global overlays, or
 * sheets, that can appear over the entire UI. For example, the sheet that lets you filter what is shown on the home heart rate chart, and for
 * "sorting" records by different attributes.
 */
export type OverlayContext = {
  ////
  // HOME HEART RATE CHART FILTER ITEMS
  ////
  chartOverlayVisible: boolean;
  setChartOverlayVisible: Dispatch<SetStateAction<boolean>>;
  visibleChartOverlays: MultiSelectListItem[];
  setVisibleChartOverlays: Dispatch<SetStateAction<MultiSelectListItem[]>>;
  ////
  // LIVE TRACKING HELP SHEET
  ////
  liveTrackingHelpSheetVisible: boolean;
  setLiveTrackingHelpSheetVisible: Dispatch<SetStateAction<boolean>>;
  ////
  // SORT PICKER
  ////
  pickerVisible: boolean;
  setPickerVisible: Dispatch<SetStateAction<boolean>>;
  ////
  // PICKER SOURCE TELLS US WHICH FEATURE/ELEMENT TRIGGERS THE PICKER
  ////
  pickerSource: string;
  setPickerSource: Dispatch<SetStateAction<string>>;
};

const OverlayContext = createContext<OverlayContext | undefined>(undefined);

export const useOverlayContext = () => {
  const context = useContext(OverlayContext);
  if (context === undefined) {
    throw new Error('useOverlayContext must be used within a OverlayProvider');
  }

  return context;
};

export const OverlayContextProvider = ({children}: {children: ReactNode}) => {
  const [chartOverlayVisible, setChartOverlayVisible] =
    useState<boolean>(false);
  const [visibleChartOverlays, setVisibleChartOverlays] = useState<
    MultiSelectListItem[]
  >([]);
  // live tracking help sheet
  const [liveTrackingHelpSheetVisible, setLiveTrackingHelpSheetVisible] =
    useState<boolean>(false);

  // sort picker
  const [pickerVisible, setPickerVisible] = useState<boolean>(false);
  const [pickerSource, setPickerSource] = useState<string>('');

  useEffect(() => {
    const getFilterItemsFromAsyncStorage = async () => {
      try {
        const itemsFromStorage = await AsyncStorage.getItem(
          'chartOverlayFilterItems',
        );
        // if no items in storage, set default
        if (!itemsFromStorage) {
          setVisibleChartOverlays([
            {
              id: '0',
              name: 'Crashes/PEM',
            },
            {
              id: '1',
              name: 'Activities',
            },
            {
              id: '2',
              name: 'Symptoms',
            },
          ]);
          return;
        }
        setVisibleChartOverlays(
          JSON.parse(itemsFromStorage) as MultiSelectListItem[],
        );
      } catch (err) {}
    };

    getFilterItemsFromAsyncStorage();
  }, []);

  const value = {
    // home heart rate chart filter items
    chartOverlayVisible,
    setChartOverlayVisible,
    visibleChartOverlays,
    setVisibleChartOverlays,
    // live tracking sheet
    liveTrackingHelpSheetVisible,
    setLiveTrackingHelpSheetVisible,
    // sort picker
    pickerVisible,
    setPickerVisible,
    pickerSource,
    setPickerSource,
  };

  return (
    <OverlayContext.Provider value={value}>{children}</OverlayContext.Provider>
  );
};
