import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, Text, View} from 'react-native';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import tw from 'twrnc';

import {AppBodyLayout, SwipeDownScrollView} from '../../components/layouts';
import {HomeStackScreenParamList} from '../../CoreNav';
import {ActivityNavigatorParamList} from './ActivityNavigator';
import {useAppleWatchContext} from '../../contexts';
import {getCircular} from '../../utils';
import {useAnalytics} from '../../hooks';

type Props = StackScreenProps<
  ActivityNavigatorParamList,
  'NewActivityRecordAppleWatch'
>;

const NewActivityRecordAppleWatch: React.FC<Props> = ({route}) => {
  const {id: activityId} = route.params.activity;
  const {sendAndStartActivityOnWatch} = useAppleWatchContext();
  const homeNavigation =
    useNavigation<
      StackNavigationProp<HomeStackScreenParamList, 'Activities'>
    >();
  const {interfaceEvent, recordEvent} = useAnalytics();

  const [activitySent, setActivitySent] = useState(false);
  const [appLaunchError, setAppLaunchError] = useState(false);

  const tryAndLaunchWatch = useCallback(async () => {
    const startResult = await sendAndStartActivityOnWatch(activityId);

    // if result succeeded
    if (startResult.success) {
      recordEvent('Activity', 'Started', {
        $screen_name: 'NewActivityRecordAppleWatch',
        platform: 'apple_watch',
      });
      setActivitySent(true);
      setTimeout(() => {
        homeNavigation.navigate('Home');
        setActivitySent(false);
      }, 3000);
    } else {
      setAppLaunchError(true);
      setTimeout(() => {
        setAppLaunchError(false);
        homeNavigation.navigate('Home');
      }, 3000);
    }
  }, [recordEvent, activityId, homeNavigation, sendAndStartActivityOnWatch]);

  useEffect(() => {
    tryAndLaunchWatch();
  }, [
    activityId,
    homeNavigation,
    interfaceEvent,
    sendAndStartActivityOnWatch,
    tryAndLaunchWatch,
  ]);

  return (
    <AppBodyLayout dismissKeyboardOnTouch={false} backgroundColor="bg-white">
      <SwipeDownScrollView
        navigator={homeNavigation}
        route="Home"
        style={tw`flex-1`}>
        {/* ADD A MASSIVE CENTER LOADER, WITH TEXT BELOW IT WITH 'STARTING ACTIVITY ON APPLE WATCH' */}
        <View style={tw`mt-20 flex-1 flex flex-col items-center`}>
          {!activitySent && !appLaunchError && (
            <>
              <ActivityIndicator size="large" />
              <Text style={[tw`text-xl mt-8 mx-5`, getCircular('Book')]}>
                Starting activity on Apple Watch...
              </Text>
            </>
          )}
          {activitySent && (
            <>
              <ActivityIndicator size="large" />
              <Text style={[tw`text-xl mt-8 text-center`, getCircular('Book')]}>
                Activity started on Apple Watch! Be sure to double check that
                the activity is running.
              </Text>
            </>
          )}
          {appLaunchError && (
            <Text
              style={[tw`text-xl mt-8 text-red-500 mx-5`, getCircular('Book')]}>
              There was an error starting this activity on your watch...
            </Text>
          )}
        </View>
      </SwipeDownScrollView>
    </AppBodyLayout>
  );
};

export default NewActivityRecordAppleWatch;
