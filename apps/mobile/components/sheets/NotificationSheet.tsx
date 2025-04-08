import React, {useRef} from 'react';
import {Text, View} from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import {Portal, PortalHost} from '@gorhom/portal';
import tw from 'twrnc';

import {useNotificationsContext} from '../../contexts';
import {BottomSheetComponent} from '../layouts';
import {H2Text} from '../elements';

const NotificationSheet = () => {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const {showMaxHrSheet, setShowMaxHrSheet} = useNotificationsContext();

  return (
    <>
      <Portal>
        <BottomSheetComponent
          showSheet={showMaxHrSheet}
          setShowSheet={setShowMaxHrSheet}
          bottomSheetRef={bottomSheetRef}
          sheetName="NotificationsSheet"
          screenName="Home"
          startingIndex={1}>
          <View style={tw`px-4 mt-10 z-2`}>
            <H2Text text="Notification details" />
            <View style={tw`flex flex-col mt-6`}>
              <Text style={tw`text-sm font-medium text-gray-600 mb-6`}>
                This is an explainer of all of the things going on.
              </Text>
            </View>
          </View>
        </BottomSheetComponent>
      </Portal>
      <PortalHost name="notificationSheet" />
    </>
  );
};

export default NotificationSheet;
