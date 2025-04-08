import React, {useState} from 'react';
import {View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import RNReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {Picker} from '@react-native-picker/picker';
import {usePostHog} from 'posthog-react-native';
import tw from 'twrnc';

import {numberToStringTime, stringTimeToNumber} from '../../../lib';
import {AppBodyLayout, SwipeDownScrollView} from '../../../components/layouts';
import {SheetNavbar} from '../../../components/sheets';
import {
  DarkButton,
  H2Text,
  InputText,
  LightButton,
} from '../../../components/elements';
import {CrashNavigatorParamList} from '../../../screens/crashes/CrashNavigator';
import {HomeStackScreenParamList} from '../../../CoreNav';
import {timeFrames} from '../../../data';

type Props = StackScreenProps<
  CrashNavigatorParamList,
  'NewCrashRecordTotalTime'
>;

const NewCrashRecordTotalTime: React.FC<Props> = ({route}) => {
  const {crashTotalTime} = route.params;
  const [totalTime, setTotalTime] = useState<string>(
    crashTotalTime ? numberToStringTime(crashTotalTime) : '-',
  );
  const homeNavigation =
    useNavigation<StackNavigationProp<HomeStackScreenParamList, 'Crashes'>>();
  const crashNavigation =
    useNavigation<
      StackNavigationProp<CrashNavigatorParamList, 'NewCrashRecordTotalTime'>
    >();
  const posthog = usePostHog();

  return (
    <AppBodyLayout dismissKeyboardOnTouch={true}>
      <SheetNavbar
        onClose={() => homeNavigation.navigate('Home')}
        posthog={posthog}
        navigation={homeNavigation}
        posthogEventName="Add crash record sheet closed"
      />
      <SwipeDownScrollView navigator={homeNavigation} route={'Home'}>
        <View style={tw`px-4 pb-5`}>
          {/* HOW LONG THE PEM LASTED PICKER */}
          <H2Text text="Select how long your Crash/PEM lasted" />
          <View style={tw`pt-1`}>
            <InputText text="Total time experiencing this crash/PEM" />
            <View style={tw`mt-1`}>
              <Picker
                selectedValue={totalTime}
                onValueChange={value => setTotalTime(value)}>
                {timeFrames.map((time, id) => (
                  <Picker.Item key={id} label={time.name} value={time} />
                ))}
              </Picker>
            </View>
          </View>
          {/* SOMETHING */}
        </View>
      </SwipeDownScrollView>
      <View style={tw`bottom-0 mb-12 items-center bg-white`}>
        <View style={tw`pt-5 w-50 mx-auto`}>
          <DarkButton
            onPress={() => {
              RNReactNativeHapticFeedback.trigger('impactLight');
              posthog?.capture('Save crash total time button pressed', {
                $screen_name: 'Home',
                component: 'DarkButton',
                buttonText: 'Confirm',
              });
              crashNavigation.navigate('NewCrashRecord', {
                ...route.params,
                crashTotalTime: stringTimeToNumber(totalTime),
              });
            }}
            text={'Confirm'}
            style={tw`mb-4`}
          />
          <LightButton
            onPress={() => {
              RNReactNativeHapticFeedback.trigger('impactLight');
              posthog?.capture('Cancel crash total time button pressed', {
                $screen_name: 'Home',
                component: 'DarkButton',
                buttonText: 'Cancel',
              });
              crashNavigation.goBack();
            }}
            text={'Cancel'}
          />
        </View>
      </View>
    </AppBodyLayout>
  );
};

export default NewCrashRecordTotalTime;
