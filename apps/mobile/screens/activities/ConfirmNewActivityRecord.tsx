import React, {useState} from 'react';
import {Text} from 'react-native';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {trigger} from 'react-native-haptic-feedback';
import {usePostHog} from 'posthog-react-native';
import advancedformat from 'dayjs/plugin/advancedFormat';
import dayjs from 'dayjs';
import tw from 'twrnc';

dayjs.extend(advancedformat);

import {
  ChevronDown,
  Header1,
  InputFieldReadOnly,
  ListBox,
  PrimaryButton,
  Subheader,
} from '@pathize/mobile-ui';
import {AppBodyLayout} from '../../components/layouts';
import {HomeStackScreenParamList} from '../../CoreNav';
import {
  useActivitiesContext,
  useOverlayContext,
  useTodayDataContext,
} from '../../contexts';
import {getCircular} from '../../utils';
import {stringTimeToNumber} from '../../lib';
import {PickerOverlaySheet, SheetNavbar} from '../../components/sheets';
import {ActivityNavigatorParamList} from './ActivityNavigator';
import {useAnalytics, useHandleLoadingError} from '../../hooks';
import {timeFrames} from '../../data';

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
  ActivityNavigatorParamList,
  'ConfirmNewActivityRecord'
>;

const ConfirmNewActivityRecord: React.FC<Props> = ({route}) => {
  const {activity} = route.params;
  const {today} = useTodayDataContext();
  const {pickerVisible, setPickerVisible, pickerSource, setPickerSource} =
    useOverlayContext();
  const {
    createActivityRecord,
    createActivityRecordLoading: loading,
    createActivityRecordError: error,
  } = useActivitiesContext();
  const homeNavigation =
    useNavigation<
      StackNavigationProp<HomeStackScreenParamList, 'Activities'>
    >();
  const {interactionEvent} = useAnalytics();
  const posthog = usePostHog();

  const [selectedTimeFrame, setSelectedTimeFrame] = useState<{
    id: string;
    name: string;
  } | null>(timeFrames[0]);
  const [date, setDate] = useState(new Date());

  const handleClosePress = () => homeNavigation.navigate('Home');
  useHandleLoadingError(error, loading, handleClosePress);

  return (
    <>
      <SheetNavbar
        onClose={() => homeNavigation.navigate('Home')}
        posthog={posthog}
        screenName="Home"
        navigation={homeNavigation}
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
          <PrimaryButton
            text="Save"
            rounded="small"
            width="half"
            loading={loading}
            padding={false}
            onPress={async () => {
              interactionEvent('Button', 'Pressed', {
                $screen_name: 'ConfirmNewActivityRecord',
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

              return await createActivityRecord(
                timeFrameAsNumber === 1440
                  ? dayjs(today)
                      .startOf('day')
                      .hour(0)
                      .minute(0)
                      .second(0)
                      .millisecond(0)
                      .toDate()
                  : dateWithTodayDay,
                activity.id,
                activity.activityName,
                activity.activityPriority,
                activity.activityIcon,
                timeFrameAsNumber,
              );
            }}
            disabled={false}
            textStyle={[getCircular('Bold'), tw``]}
          />
        }>
        {/* HEADER */}
        <Header1
          paddingBottom={true}
          text={'Confirm this activities details'}
          style={[tw`text-slate-900 text-2xl font-bold`, getCircular('Bold')]}
        />
        {/* SUBHEADER */}
        <Subheader
          paddingBottom={false}
          text={`Recording for ${dayjs(today).format('MMMM Do')}.`}
          style={[tw``, getCircular('Book')]}
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
            setPickerSource('confirmNewActivityRecord');
            setPickerVisible(!pickerVisible);
          }}
          headerText="Total time"
          placeholderText="Total time not set, please select a total time"
          value={selectedTimeFrame!.name}
          rightComponent={<ChevronDown size={16} color="#d4d4d8" />}
        />
        {/* PICKER IS VISIBLE FOR TYPE AND UNITS */}
        {pickerVisible && pickerSource === 'confirmNewActivityRecord' && (
          <PickerOverlaySheet
            items={timeFrames}
            selectedItem={selectedTimeFrame}
            setSelectedItem={setSelectedTimeFrame}
            labelKey="name"
            portalHost="confirmNewActivityRecord"
          />
        )}
      </AppBodyLayout>
    </>
  );
};

export default ConfirmNewActivityRecord;
