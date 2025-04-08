import React, {useState} from 'react';
import {Text} from 'react-native';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {trigger} from 'react-native-haptic-feedback';
import {usePostHog} from 'posthog-react-native';
import dayjs from 'dayjs';
import tw from 'twrnc';

import {
  ChevronDown,
  DangerButton,
  Header1,
  InputFieldReadOnly,
  ListBox,
  PrimaryButton,
} from '@pathize/mobile-ui';
import {
  useActivitiesContext,
  useOverlayContext,
  useTodayDataContext,
} from '../../contexts';
import {HomeStackScreenParamList} from '../../CoreNav';
import {getCircular} from '../../utils';
import {AppBodyLayout} from '../../components/layouts';
import {
  numberToStringTime,
  stringTimeToNumber,
  twoButtonAlert,
} from '../../lib';
import {PickerOverlaySheet, SheetNavbar} from '../../components/sheets';
import {ActivityNavigatorParamList} from './ActivityNavigator';
import {useAnalytics, useHandleLoadingError} from '../../hooks';
import {timeFrames} from '../../data';
import {ActivityStats} from '../../features/activities';

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

type Props = StackScreenProps<ActivityNavigatorParamList, 'EditActivityRecord'>;

const EditActivityRecord: React.FC<Props> = ({route}) => {
  const {activity} = route.params;
  const {pickerVisible, setPickerVisible, pickerSource, setPickerSource} =
    useOverlayContext();
  const {
    updateActivityRecord,
    updateActivityRecordLoading,
    updateActivityRecordError,
    deleteActivityRecord,
    deleteActivityRecordLoading,
    deleteActivityRecordError,
  } = useActivitiesContext();
  const {today} = useTodayDataContext();

  const homeNavigation =
    useNavigation<
      StackNavigationProp<HomeStackScreenParamList, 'Activities'>
    >();
  const posthog = usePostHog();
  const {interactionEvent} = useAnalytics();

  // TODO: activity time map breaks if it is a custom amount of time
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<{
    id: string;
    name: string;
  } | null>(
    timeFrames.find(
      timeFrame =>
        timeFrame.name === numberToStringTime(activity.activityTotalTime ?? 0),
    ) ?? {
      id: 'custom',
      name: numberToStringTime(activity.activityTotalTime ?? 0),
    },
  );
  const [date, setDate] = useState<Date>(dayjs(activity.time).toDate());

  const handleClosePress = () => homeNavigation.navigate('Home');
  useHandleLoadingError(
    updateActivityRecordError,
    updateActivityRecordLoading,
    handleClosePress,
  );
  useHandleLoadingError(
    deleteActivityRecordError,
    deleteActivityRecordLoading,
    handleClosePress,
  );

  return (
    <>
      <SheetNavbar
        onClose={() => homeNavigation.navigate('Home')}
        posthog={posthog}
        screenName="Home"
      />
      <AppBodyLayout
        scrollable={true}
        avoidKeyboard={true}
        padding={false}
        paddingSides={true}
        navigator={homeNavigation}
        swipeToDismiss={true}
        dismissKeyboardOnTouch={true}
        route="Home"
        backgroundColor="bg-white"
        absoluteBottomChild={
          <>
            <PrimaryButton
              text="Save"
              rounded="small"
              width="half"
              loading={updateActivityRecordLoading}
              padding={false}
              onPress={() => {
                interactionEvent('Button', 'Pressed', {
                  $screen_name: 'EditUserActivity',
                  value: 'Save',
                });

                const timeFrameAsNumber = stringTimeToNumber(
                  selectedTimeFrame!.name,
                );
                const dateWithTodayDay = dayjs(date)
                  .set('year', dayjs(today).year())
                  .set('month', dayjs(today).month())
                  .set('date', dayjs(today).date())
                  .toDate();

                updateActivityRecord(
                  activity.id,
                  timeFrameAsNumber,
                  timeFrameAsNumber === 1440
                    ? dayjs(today)
                        .startOf('day')
                        .hour(0)
                        .minute(0)
                        .second(0)
                        .millisecond(0)
                        .toDate()
                    : dateWithTodayDay,
                );
              }}
              disabled={false}
              textStyle={[getCircular('Bold'), tw``]}
            />
            <DangerButton
              text="Delete this activity"
              rounded="small"
              width="half"
              padding={true}
              loading={deleteActivityRecordLoading}
              onPress={() => {
                twoButtonAlert(
                  'Delete activity',
                  'Are you sure you want to delete this activity record? This action cannot be undone.',
                  'Cancel',
                  'Yes, delete',
                  async () => await deleteActivityRecord(activity.id),
                  posthog,
                );
              }}
              textStyle={[getCircular('Bold'), tw``]}
            />
          </>
        }>
        {/* HEADER */}
        <Header1
          padding={false}
          text={activity.activityName}
          style={[tw`text-slate-900 text-2xl font-bold `, getCircular('Bold')]}
        />
        {/* CHOOSING THE TIME */}
        <ListBox
          style={tw`mb-3`}
          paddingSides={true}
          padding={true}
          border={true}
          textChild={<ActivityTimeChild time={'Start time'} />}
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
        {/* TOTAL TIME PICKER */}
        <InputFieldReadOnly
          style={[tw``, getCircular('Book')]}
          inputBackgroundColor="bg-white"
          borderAlways={true}
          padding={false}
          onFocus={() => {
            trigger('impactLight');
            setPickerSource('editActivityRecord');
            setPickerVisible(!pickerVisible);
          }}
          headerText="Total time"
          placeholderText="Total time not set, please select a total time"
          value={selectedTimeFrame!.name}
          rightComponent={<ChevronDown size={16} color="#d4d4d8" />}
        />
        {/* PICKER IS VISIBLE FOR TYPE AND UNITS */}
        {pickerVisible && pickerSource === 'editActivityRecord' && (
          <PickerOverlaySheet
            items={timeFrames}
            selectedItem={selectedTimeFrame}
            setSelectedItem={setSelectedTimeFrame}
            labelKey="name"
            portalHost="editActivityRecord"
          />
        )}
        {/* BOTTOM STATS AREA */}
        <ActivityStats activity={activity} />
      </AppBodyLayout>
    </>
  );
};

export default EditActivityRecord;
