import React, {useState} from 'react';
import {View} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import {usePostHog} from 'posthog-react-native';
import tw from 'twrnc';

import {AppBodyLayout, SwipeDownScrollView} from '../../components/layouts';
import {trigger} from 'react-native-haptic-feedback';
import {
  DarkButton,
  H2Text,
  InputText,
  LightButton,
} from '../../components/elements';
import {numberToStringTime, stringTimeToNumber} from '../../lib';
import {SheetNavbar} from '../../components/sheets';
import {timeFrames} from '../../data';
import {ActivityNavigatorParamList} from './ActivityNavigator';
import {HomeStackScreenParamList} from '../../CoreNav';

type Props = StackScreenProps<
  ActivityNavigatorParamList,
  'NewActivityRecordTimeRange'
>;

const NewActivityRecordTimeRange: React.FC<Props> = ({route}) => {
  const {activity} = route.params;
  const homeNavigation =
    useNavigation<
      StackNavigationProp<HomeStackScreenParamList, 'Activities'>
    >();
  const activityNavigation =
    useNavigation<
      StackNavigationProp<ActivityNavigatorParamList, 'AddNewActivityRecord'>
    >();
  const posthog = usePostHog();
  const [totalTime, setTotalTime] = useState<string>(
    activity.activityTotalTime
      ? numberToStringTime(activity.activityTotalTime)
      : '-',
  );

  return (
    <AppBodyLayout dismissKeyboardOnTouch={true}>
      <SheetNavbar
        onClose={() => homeNavigation.navigate('Home')}
        posthog={posthog}
        navigation={activityNavigation}
        posthogEventName="Add activity record sheet closed"
      />
      <SwipeDownScrollView navigator={homeNavigation} route={'Home'}>
        <View style={tw`px-4 py-5 mt-5`}>
          <H2Text text="Select how long you spent on this activity" />
          <View style={tw`pt-4`}>
            <InputText text="Total time (optional)" />
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
        </View>
      </SwipeDownScrollView>
      <View style={tw`bottom-0 mb-12 items-center bg-white`}>
        <View style={tw`pt-5 w-50 mx-auto`}>
          <DarkButton
            onPress={() => {
              trigger('impactLight');
              posthog?.capture('Save activity total time button pressed', {
                $screen_name: 'Home',
                component: 'DarkButton',
                buttonText: 'Confirm',
              });
              activityNavigation.navigate('ConfirmNewActivityRecord', {
                activity: {
                  ...activity,
                  activityTotalTime: stringTimeToNumber(totalTime),
                },
              });
            }}
            text={'Confirm'}
            style={tw`mb-4`}
          />
          <LightButton
            onPress={() => {
              trigger('impactLight');
              posthog?.capture('Cancel activity total time button pressed', {
                $screen_name: 'Home',
                component: 'DarkButton',
                buttonText: 'Cancel',
              });
              activityNavigation.goBack();
            }}
            text={'Cancel'}
          />
        </View>
      </View>
    </AppBodyLayout>
  );
};

export default NewActivityRecordTimeRange;
