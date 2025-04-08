import React, {useCallback, useState} from 'react';
import {RefreshControl, View} from 'react-native';
import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import tw from 'twrnc';

import {Header1, Loading, PressableCard} from '@pathize/mobile-ui';
import {
  useTodayDataContext,
  useOverlayContext,
  useTerraContext,
  useLimitContext,
  usePathizeSelectedDayContext,
} from '../../contexts';
import {
  AppBodyLayout,
  FadeInView,
  HomeLogicLayout,
  MainAppLayout,
  ChartOverlayFilterSheet,
} from '../../components';
import DayPickerSheet from '../../components/sheets/DayPickerSheet';
import {useAnalytics, useInternetConnectivity} from '../../hooks';
import {getCircular} from '../../utils';
import {TabbedNavigatorParamList} from './HomeNavigator';
import {PacingHomeStatsArea} from '../../features/pacingDetails';
import {LiveTracking} from '../../features/liveTracking/components/LiveTracking';
import {FirstTimeSetup} from '../../features/firstTimeSetup';
import {EnergyBudget} from '../../features/energyBudget';
import {Pacing} from '../../features/pacing';
import {Records} from '../../features/records';
import {Todos} from '../../features/todos';

const IsNotConnected = () => {
  return (
    <View style={[tw`flex flex-col items-center m-auto h-100 pt-40 w-90`]}>
      <Header1
        text="You're offline. Please check to see if you have an active internet connection."
        style={[tw`text-center`, getCircular('Bold')]}
      />
    </View>
  );
};

type Props = BottomTabScreenProps<TabbedNavigatorParamList, 'HomeScreen'>;

export const HomeScreen: React.FC<Props> = () => {
  const [refreshing, setRefreshing] = useState(false);

  const homeNavigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const {
    state: {loading},
    updatePathizeSelectedDay,
  } = usePathizeSelectedDayContext();
  const {limit} = useLimitContext();
  const {today} = useTodayDataContext();
  const {isConnected} = useInternetConnectivity();
  const {chartOverlayVisible} = useOverlayContext();
  const {interactionEvent} = useAnalytics();
  const {terraDevice, terraDeviceLoading} = useTerraContext();

  const onRefresh = async () => {
    // do not execute refresh if we are loading or if limit is not available
    if (!limit || loading) return;
    setRefreshing(true);
    await updatePathizeSelectedDay(today, limit, false);
    setRefreshing(false);
  };

  const onPressCard = useCallback(() => {
    interactionEvent('Button', 'Pressed', {
      $screen_name: 'HomeScreen',
      value: 'Add a new device',
    });
    homeNavigation.navigate('ProfileScreen', {
      screen: 'Devices',
    });
  }, [homeNavigation, interactionEvent]);

  return (
    <MainAppLayout
      backgroundColor="bg-sky-950"
      applyTopInsets={true}
      statusBarStyle={'light-content'}>
      <AppBodyLayout
        backgroundColor="bg-white"
        avoidKeyboard={false}
        dismissKeyboardOnTouch={false}
        padding={false}
        refreshControl={
          terraDevice ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              progressViewOffset={0}
            />
          ) : undefined
        }
        scrollable={true}>
        <HomeLogicLayout>
          {/* DAY PICKER */}
          <DayPickerSheet />
          {/* SHOW THIS WHEN THERE IS NO INTERNET CONNECTIVITY */}
          {isConnected === false && terraDeviceLoading === false ? (
            <IsNotConnected />
          ) : null}
          {/* WHEN ONLINE */}
          {isConnected === true ? (
            <View
              style={[
                tw`flex flex-col`,
                {
                  marginTop: insets.top + 0,
                },
              ]}>
              {/* FIRST TIME SETUP */}
              <FirstTimeSetup style={[tw`bg-gray-100`]} />

              {/* IF THERE IS NO DEVICE AND WE ARE DONE LOADING ONE */}
              {!terraDevice && terraDeviceLoading === false ? (
                <FadeInView duration={200} style={tw`mt-6`}>
                  <PressableCard
                    onPress={onPressCard}
                    headerText="Pathize is better connected to Apple Health"
                    textChild="Connect to Apple Health to correlate records with your biometrics."
                    alertChild={'+'}
                    headerTextStyle={[tw``, getCircular('Bold')]}
                    bodyTextStyle={[tw``, getCircular('Book')]}
                    style={[tw`mx-6`]}
                  />
                </FadeInView>
              ) : null}
              {/* ENERGY BUDGET */}
              {terraDevice ? <EnergyBudget /> : null}
              {/* IF TERRA DEVICE */}
              {terraDevice ? (
                <FadeInView duration={200}>
                  <Pacing />
                  {/* <Todos /> */}
                  <PacingHomeStatsArea />
                </FadeInView>
              ) : null}
              {/* IF NO DEVICE AND TERRA DEVICE LOADING */}
              {terraDeviceLoading === true ? (
                <FadeInView duration={200}>
                  <View
                    style={tw`h-100 flex-1 justify-center items-center p-10`}>
                    <Loading loading={true} />
                  </View>
                </FadeInView>
              ) : null}
              {/* TODO LIST */}
              <Todos />
              {/* ALWAYS SHOW RECORDS */}
              <FadeInView duration={200}>
                <Records />
              </FadeInView>
              {/* QUICK ACTIONS */}
              {terraDevice ? (
                <FadeInView duration={200}>
                  <LiveTracking style={tw`mb-10`} />
                </FadeInView>
              ) : null}
            </View>
          ) : null}
          {/* BOTTOM SPACE */}
          {chartOverlayVisible && <ChartOverlayFilterSheet />}
        </HomeLogicLayout>
      </AppBodyLayout>
    </MainAppLayout>
  );
};

// HomeScreen.whyDidYouRender = true;
