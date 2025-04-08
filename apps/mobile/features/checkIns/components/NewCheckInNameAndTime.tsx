import React, {useState} from 'react';
import {Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import {usePostHog} from 'posthog-react-native';
import tw from 'twrnc';

import {useAnalytics} from '../../hooks';
import {CheckInNavigatorParamList} from './CheckInsNavigator';
import {ProfileScreenParamList} from '../profile/ProfileScreenNavigator';
import {Header1, InputField, ListBox, PrimaryButton} from '@pathize/mobile-ui';
import {getCircular} from '../../utils';
import {AppBodyLayout} from '../../components/layouts';
import {SheetNavbar} from '../../components/sheets';

const ActivityTimeChild: React.FC<{time: string}> = ({time}) => {
  return (
    <Text
      style={[
        getCircular('Book'),
        tw`text-black text-opacity-80 text-base leading-tight`,
      ]}>
      {time}
    </Text>
  );
};

type Props = StackScreenProps<
  CheckInNavigatorParamList,
  'NewCheckInNameAndTime'
>;

const NewCheckInNameAndTime: React.FC<Props> = () => {
  const posthog = usePostHog();
  const {interactionEvent} = useAnalytics();
  const [checkInName, setCheckInName] = useState('');
  const [date, setDate] = useState(new Date());

  const randomPlaceholder = (): string => {
    const p1 = 'Morning medications';
    const p2 = 'Evening check-in';
    const p3 = 'Afternoon check-in';
    const p4 = 'Daily symptoms';
    return [p1, p2, p3, p4][Math.floor(Math.random() * 4)];
  };

  const profileNavigation =
    useNavigation<
      StackNavigationProp<ProfileScreenParamList, 'UserCheckIns'>
    >();
  const checkInNavigation =
    useNavigation<
      StackNavigationProp<CheckInNavigatorParamList, 'NewCheckInNameAndTime'>
    >();

  return (
    <>
      <SheetNavbar
        onClose={() => profileNavigation.navigate('UserCheckIns')}
        screenName="NewCheckInNameAndTime"
        posthog={posthog}
      />
      <AppBodyLayout
        dismissKeyboardOnTouch={true}
        scrollable={true}
        avoidKeyboard={true}
        paddingSides={true}
        navigator={checkInNavigation}
        swipeToDismiss={true}
        route="UserCheckIns"
        backgroundColor="bg-white"
        absoluteBottomChild={
          <PrimaryButton
            padding={false}
            width="half"
            rounded="small"
            onPress={() => {
              interactionEvent('Button', 'Pressed', {
                $screen_name: 'Name',
                value: 'Continue',
              });

              checkInNavigation.navigate('NewCheckInMedications', {
                checkIn: {
                  name: checkInName,
                  time: date,
                },
              });
            }}
            text="Continue"
            disabled={checkInName.length === 0 ? true : false}
            textStyle={[tw``, getCircular('Bold')]}
          />
        }>
        {/* HEADER */}
        <Header1
          text="Select a name for this check-in, and when you'd like to be notified"
          style={[tw`text-slate-900 text-2xl font-bold `, getCircular('Bold')]}
        />
        {/* NAME */}
        <InputField
          padding={true}
          headerText="Check-in name"
          inputBackgroundColor="bg-white"
          value={checkInName}
          onChangeText={setCheckInName}
          placeholderText={randomPlaceholder()}
          onFocus={() => {
            interactionEvent('Input', 'Focused', {
              $screen_name: 'NewCheckInNameAndTime',
              value: checkInName,
            });
          }}
          style={[tw``, getCircular('Book')]}
        />
        {/* TIME */}
        <ListBox
          style={tw`mb-3`}
          paddingSides={true}
          padding={true}
          border={true}
          textChild={<ActivityTimeChild time={'Notification time'} />}
          rightChild={
            <DateTimePicker
              onChange={(e, d) => {
                if (!d) return;
                setDate(d);
              }}
              mode="time"
              value={date}
            />
          }
        />
      </AppBodyLayout>
    </>
  );
};

export default NewCheckInNameAndTime;
