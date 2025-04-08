import React, {
  Dispatch,
  SetStateAction,
  useMemo,
  useCallback,
  RefObject,
} from 'react';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import tw from 'twrnc';

import {CustomSheetBackdrop, Handle as CustomSheetHandle} from './';
import {Portal, PortalHost} from '@gorhom/portal';
import {AllScreenParams, useAnalytics} from '../../hooks';

type Props = {
  showSheet: boolean;
  setShowSheet: Dispatch<SetStateAction<boolean>>;
  sheetName: string;
  screenName: string;
  bottomSheetRef?: RefObject<BottomSheet>;
  children?: React.ReactNode;
  panDownToClose?: boolean;
  startingIndex?: number;
};

export const BottomSheetComponent: React.FC<Props> = ({
  showSheet,
  setShowSheet,
  sheetName,
  children,
  screenName,
  bottomSheetRef,
  panDownToClose = true,
  startingIndex = 0,
}): JSX.Element => {
  const snapPoints = useMemo(() => ['40%', '90%'], []);
  const {interactionEvent} = useAnalytics();

  const handleSheetChanges = useCallback((index: number) => {
    bottomSheetRef?.current?.snapToIndex(index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleClosePress = useCallback(() => {
    bottomSheetRef?.current?.close();
    setTimeout(() => {
      setShowSheet(!showSheet);
    }, 200);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Portal>
        <BottomSheet
          handleComponent={CustomSheetHandle}
          backdropComponent={CustomSheetBackdrop}
          ref={bottomSheetRef}
          index={startingIndex}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
          enablePanDownToClose={panDownToClose}
          onClose={() => {
            interactionEvent('Sheet', 'Closed', {
              $screen_name: screenName as AllScreenParams,
              value: sheetName,
            });
            handleClosePress();
          }}>
          <BottomSheetView style={tw`flex-1`}>{children}</BottomSheetView>
        </BottomSheet>
      </Portal>
      <PortalHost name="bottomSheetComponent" />
    </>
  );
};
