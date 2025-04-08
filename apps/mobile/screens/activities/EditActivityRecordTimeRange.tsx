import React, {useState} from 'react';
import {View} from 'react-native';
import {trigger} from 'react-native-haptic-feedback';
import {ScrollView} from 'react-native-gesture-handler';
import {Picker} from '@react-native-picker/picker';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import {usePostHog} from 'posthog-react-native';
import tw from 'twrnc';

import {AppBodyLayout} from '../../components/layouts';
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
import {useAnalytics} from '../../hooks';

type Props = StackScreenProps<
  ActivityNavigatorParamList,
  'EditActivityRecordTimeRange'
>;

const EditActivityRecordTimeRange: React.FC<Props> = ({route}) => {
  const {activity} = route.params;
  const homeNavigation =
    useNavigation<
      StackNavigationProp<HomeStackScreenParamList, 'Activities'>
    >();
  const activityNavigation =
    useNavigation<
      StackNavigationProp<
        ActivityNavigatorParamList,
        'EditActivityRecordTimeRange'
      >
    >();
  const posthog = usePostHog();
  const {interactionEvent} = useAnalytics();
  const [totalTime, setTotalTime] = useState<string>(
    activity.activityTotalTime
      ? numberToStringTime(activity.activityTotalTime)
      : '-',
  );

  return (
    <AppBodyLayout dismissKeyboardOnTouch={false}>
      <SheetNavbar
        onClose={() => homeNavigation.navigate('Home')}
        posthog={posthog}
        navigation={homeNavigation}
      />
      <ScrollView>
        <View style={tw`px-4 pb-5`}>
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
      </ScrollView>
      <View style={tw`bottom-0 mb-12 items-center bg-white`}>
        <View style={tw`pt-5 w-50 mx-auto`}>
          <DarkButton
            onPress={() => {
              trigger('impactLight');

              interactionEvent('Button', 'Pressed', {
                $screen_name: 'Home',
                value: 'Confirm',
              });

              activityNavigation.navigate('EditActivityRecord', {
                activity: {
                  ...activity,
                  activityTotalTime: stringTimeToNumber(totalTime),
                },
              });
            }}
            text={'Confirm'}
            style={tw`mb-5`}
          />
          <LightButton
            onPress={() => {
              trigger('impactLight');

              interactionEvent('Button', 'Pressed', {
                $screen_name: 'Home',
                value: 'Cancel',
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

export default EditActivityRecordTimeRange;
