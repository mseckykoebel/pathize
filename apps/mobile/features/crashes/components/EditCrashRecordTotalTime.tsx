import React, {useState} from 'react';
import {View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import {trigger} from 'react-native-haptic-feedback';
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

const times = [
  '-',
  'All day',
  '5 minutes',
  '10 minutes',
  '15 minutes',
  '20 minutes',
  '25 minutes',
  '30 minutes',
  '35 minutes',
  '40 minutes',
  '45 minutes',
  '50 minutes',
  '55 minutes',
  '1 hour',
  '1 hour, 15 minutes',
  '1 hour, 30 minutes',
  '1 hour, 45 minutes',
  '2 hours',
  '2 hours, 15 minutes',
  '2 hours, 30 minutes',
  '2 hours, 45 minutes',
  '3 hours',
  '3 hours, 15 minutes',
  '3 hours, 30 minutes',
  '3 hours, 45 minutes',
  '4 hours',
  '4 hours, 15 minutes',
  '4 hours, 30 minutes',
  '4 hours, 45 minutes',
  '5 hours',
  '5 hours, 15 minutes',
  '5 hours, 30 minutes',
  '5 hours, 45 minutes',
  '6 hours',
  '6 hours, 15 minutes',
  '6 hours, 30 minutes',
  '6 hours, 45 minutes',
  '7 hours',
  '7 hours, 15 minutes',
  '7 hours, 30 minutes',
  '7 hours, 45 minutes',
  '8 hours',
  '8 hours, 15 minutes',
  '8 hours, 30 minutes',
  '8 hours, 45 minutes',
  '9 hours',
];

type Props = StackScreenProps<
  CrashNavigatorParamList,
  'EditCrashRecordTotalTime'
>;

const EditCrashRecordTotalTime: React.FC<Props> = ({route}) => {
  const {crashTotalTime} = route.params.crash;
  const [totalTime, setTotalTime] = useState<string>(
    crashTotalTime ? numberToStringTime(crashTotalTime) : '-',
  );
  const posthog = usePostHog();
  const homeNavigation =
    useNavigation<StackNavigationProp<HomeStackScreenParamList, 'Crashes'>>();
  const crashNavigation =
    useNavigation<
      StackNavigationProp<CrashNavigatorParamList, 'EditCrashRecordTotalTime'>
    >();

  return (
    <AppBodyLayout dismissKeyboardOnTouch={true}>
      <SheetNavbar
        onClose={() => homeNavigation.navigate('Home')}
        posthog={posthog}
        navigation={homeNavigation}
        posthogEventName="Edit crash record sheet closed"
      />
      <SwipeDownScrollView navigator={homeNavigation} route={'Home'}>
        <View style={tw`px-4 py-5 mt-5`}>
          <H2Text text="Select how long your Crash/PEM lasted" />
          <View style={tw`pt-4`}>
            <InputText text="Total time experiencing this crash/PEM" />
            <View style={tw`mt-1`}>
              <Picker
                selectedValue={totalTime}
                onValueChange={value => setTotalTime(value)}>
                {times.map((time, id) => (
                  <Picker.Item key={id} label={time} value={time} />
                ))}
              </Picker>
            </View>
          </View>
        </View>
      </SwipeDownScrollView>
      <View style={tw`bottom-0 mb-12 items-center bg-white`}>
        <View style={tw`pt-5 w-50 mx-auto`}>
          <DarkButton
            onPress={() => {
              trigger('impactLight');
              posthog?.capture('Save crash total time button pressed', {
                $screen_name: 'Home',
                component: 'DarkButton',
                buttonText: 'Confirm',
              });
              crashNavigation.navigate('EditCrashRecord', {
                crash: {
                  ...route.params.crash,
                  crashTotalTime: stringTimeToNumber(totalTime),
                },
              });
            }}
            text={'Confirm'}
            style={tw`mb-4`}
          />
          <LightButton
            onPress={() => {
              trigger('impactLight');
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

export default EditCrashRecordTotalTime;
