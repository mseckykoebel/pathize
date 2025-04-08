import React, {useRef, useMemo, useCallback, useEffect} from 'react';
import {View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import {Portal, PortalHost} from '@gorhom/portal';
import tw from 'twrnc';

import {Header2} from '@pathize/mobile-ui';
import {CustomSheetBackdrop, Handle as CustomSheetHandle} from '../layouts';
import {useOverlayContext} from '../../contexts';
import {MultiSelectListSecondary} from '../elements';
import {getCircular} from '../../utils';
import {useAnalytics} from '../../hooks';

type MultiSelectListItem = {
  id: string;
  name: string;
};

const FilterItems: MultiSelectListItem[] = [
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
];

export const ChartOverlayFilterSheet: React.FC = () => {
  const {
    setChartOverlayVisible,
    visibleChartOverlays,
    setVisibleChartOverlays,
  } = useOverlayContext();
  const {interactionEvent} = useAnalytics();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%'], []);

  const handleSheetChanges = useCallback((index: number) => {
    bottomSheetRef.current?.snapToIndex(index);
  }, []);
  const handleClosePress = useCallback(async () => {
    bottomSheetRef.current?.close();
    setTimeout(() => setChartOverlayVisible(false));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const getFilterItemsFromAsyncStorage = async () => {
      try {
        const itemsFromStorage = await AsyncStorage.getItem(
          'chartOverlayFilterItems',
        );
        if (!itemsFromStorage) return;
        setVisibleChartOverlays(
          JSON.parse(itemsFromStorage) as MultiSelectListItem[],
        );
      } catch (err) {}
    };

    getFilterItemsFromAsyncStorage();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const saveToAsyncStorage = async () => {
      try {
        await AsyncStorage.setItem(
          'chartOverlayFilterItems',
          JSON.stringify(visibleChartOverlays),
        );
      } catch (err) {}
    };

    saveToAsyncStorage();
  }, [visibleChartOverlays]);

  return (
    <>
      <Portal>
        <BottomSheet
          handleComponent={CustomSheetHandle}
          backdropComponent={CustomSheetBackdrop}
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
          enablePanDownToClose={true}
          onClose={() => {
            interactionEvent('Button', 'Pressed', {
              $screen_name: 'Home',
            });

            handleClosePress();
          }}>
          <BottomSheetView style={tw`flex-1`}>
            <View style={tw`px-4 py-5`}>
              <Header2
                text="Filter what's shown on the heart rate chart above"
                textStyle={[
                  tw`font-semibold text-slate-950`,
                  getCircular('Book'),
                ]}
              />
              <MultiSelectListSecondary
                style={tw`mt-3`}
                screenName="Home"
                items={FilterItems}
                selectedItems={visibleChartOverlays}
                setItems={setVisibleChartOverlays}
              />
            </View>
          </BottomSheetView>
        </BottomSheet>
      </Portal>
      <PortalHost name="chartOverlayFilterSheet" />
    </>
  );
};
