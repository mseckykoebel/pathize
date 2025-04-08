import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import tw from 'twrnc';

import CoreNav from './CoreNav';

/**
 * @description display notification when we receive a message from FCM
 */
async function onMessageReceived(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
) {
  const {notification} = remoteMessage;
  if (notification?.body && notification?.title) {
    await notifee.displayNotification({
      title: notification.title,
      body: notification.body,
    });
  }
}

messaging().onMessage(onMessageReceived);
messaging().setBackgroundMessageHandler(onMessageReceived);

const App: React.FC = (): JSX.Element => {
  return (
    <GestureHandlerRootView style={tw`flex-1`}>
      <CoreNav />
    </GestureHandlerRootView>
  );
};

export default App;
