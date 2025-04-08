import React, {useRef, useMemo, useCallback} from 'react';
import {View} from 'react-native';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import {Portal, PortalHost} from '@gorhom/portal';
import tw from 'twrnc';

import {PrimaryButton} from '@pathize/mobile-ui';
import {Handle as CustomSheetHandle} from '../layouts';
import {useOverlayContext} from '../../contexts';
import {getCircular} from '../../utils';
import {AllScreenParams, useAnalytics} from '../../hooks';

type Props = {
  onPress: () => void;
  screenName: AllScreenParams;
  buttonText: string;
  loading?: boolean;
};

export const ButtonOverlaySheet: React.FC<Props> = ({
  onPress,
  screenName,
  buttonText,
  loading = false,
}) => {
  const {interactionEvent} = useAnalytics();
  const {setPickerVisible} = useOverlayContext();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['18%'], []);

  const handleClosePress = useCallback(async () => {
    bottomSheetRef.current?.close();
    setTimeout(() => {
      setPickerVisible(false);
    }, 100);
  }, [setPickerVisible]);

  return (
    <>
      <Portal>
        <BottomSheet
          handleComponent={CustomSheetHandle}
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          enablePanDownToClose={false}
          onClose={handleClosePress}>
          <BottomSheetView style={tw`flex-1`}>
            <View style={tw`flex-1 justify-end pl-10 pr-10 pb-10`}>
              <PrimaryButton
                text={buttonText}
                onPress={() => {
                  interactionEvent('Button', 'Pressed', {
                    $screen_name: screenName as AllScreenParams,
                    value: buttonText,
                  });
                  onPress();
                  handleClosePress();
                }}
                width="half"
                rounded="small"
                textStyle={[getCircular('Bold'), tw``]}
                loading={loading}
              />
            </View>
          </BottomSheetView>
        </BottomSheet>
      </Portal>
      <PortalHost name="buttonOverlay" />
    </>
  );
};
