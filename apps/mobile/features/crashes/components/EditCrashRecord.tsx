import React, {useState} from 'react';
import {ScrollView, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import {usePostHog} from 'posthog-react-native';
import {trigger} from 'react-native-haptic-feedback';
import dayjs from 'dayjs';
import tw from 'twrnc';

import {Crash} from '@pathize/db';
import {AppBodyLayout} from '../../../components/layouts';
import {getCircular} from '../../../utils';
import {
  useCrashesContext,
  useOverlayContext,
  useTodayDataContext,
} from '../../../contexts';
import {
  numberToStringTime,
  stringTimeToNumber,
  twoButtonAlert,
} from '../../../lib';
import {SheetNavbar} from '../../../components/sheets/SheetNavbar';
import {HomeStackScreenParamList} from '../../../CoreNav';
import {CrashNavigatorParamList} from '../../../screens/crashes/CrashNavigator';
import {timeFrames} from '../../../data';
import {
  ChevronDown,
  DangerButton,
  Header1,
  InputField,
  InputFieldReadOnly,
  ListBox,
  PrimaryButton,
  Subheader,
  ZeroFiveScaleSlider,
} from '@pathize/mobile-ui';
import {useAnalytics, useHandleLoadingError} from '../../../hooks';
import {PickerOverlaySheet} from '../../../components/sheets';

const CrashTimeChild: React.FC<{time: string}> = ({time}) => {
  return (
    <Text
      style={[
        getCircular('Book'),
        tw`h-6 text-black text-opacity-80 text-base leading-tight`,
      ]}>
      {time}
    </Text>
  );
};

type Props = StackScreenProps<CrashNavigatorParamList, 'EditCrashRecord'>;

const EditCrashRecord: React.FC<Props> = ({route}) => {
  const {
    id,
    time,
    crashTotalTime,
    notes: initialNotes,
    severity: initialCrashSeverity,
  }: Crash = route.params.crash;

  const {pickerVisible, setPickerVisible, pickerSource, setPickerSource} =
    useOverlayContext();
  const {
    updateCrashRecord,
    updateCrashLoading,
    updateCrashError,
    deleteCrashRecord,
    deleteCrashLoading,
    deleteCrashError,
  } = useCrashesContext();
  const {today} = useTodayDataContext();
  const {interactionEvent} = useAnalytics();
  const posthog = usePostHog();

  const [selectedTimeFrame, setSelectedTimeFrame] = useState<{
    id: string;
    name: string;
  } | null>(
    timeFrames.find(
      timeFrame => timeFrame.name === numberToStringTime(crashTotalTime ?? 0),
    ) ?? timeFrames[0],
  );
  const [sliderValue, setSliderValue] = useState(initialCrashSeverity ?? 0);
  const [date, setDate] = useState(new Date(dayjs(time).toDate()));
  const [notes, onNotesChange] = useState<string>(initialNotes ?? '');

  const homeNavigation =
    useNavigation<StackNavigationProp<HomeStackScreenParamList, 'Crashes'>>();
  // process upon successful update or delete
  const handleClosePress = () => homeNavigation.navigate('Home');
  useHandleLoadingError(updateCrashError, updateCrashLoading, handleClosePress);
  useHandleLoadingError(deleteCrashError, deleteCrashLoading, handleClosePress);

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
              loading={updateCrashLoading}
              padding={false}
              onPress={async () => {
                interactionEvent('Button', 'Pressed', {
                  $screen_name: 'UserActivities',
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

                await updateCrashRecord(
                  id,
                  timeFrameAsNumber,
                  sliderValue,
                  timeFrameAsNumber === 1440
                    ? dayjs(today)
                        .startOf('day')
                        .hour(0)
                        .minute(0)
                        .second(0)
                        .millisecond(0)
                        .toDate()
                    : dateWithTodayDay,
                  notes,
                );
              }}
              disabled={false}
              textStyle={[getCircular('Bold'), tw``]}
            />
            <DangerButton
              text="Delete this crash"
              rounded="small"
              width="half"
              padding={true}
              loading={deleteCrashLoading}
              onPress={() => {
                twoButtonAlert(
                  'Delete crash',
                  'Are you sure you want to delete this crash record? This action cannot be undone.',
                  'Cancel',
                  'Yes, delete',
                  () => deleteCrashRecord(id),
                  posthog,
                );
              }}
              textStyle={[getCircular('Bold'), tw``]}
            />
          </>
        }>
        {/* HEADER */}
        <Header1
          paddingBottom={true}
          text={'Editing crash/PEM'}
          style={[tw`text-slate-900 text-2xl font-bold `, getCircular('Bold')]}
        />
        {/* SUBHEADER */}
        <Subheader
          paddingBottom={true}
          text="Crashes, or PEM, are instances where your condition is much worse than usual. Usually, PEM happens 12 to 72 hours after prolonged exertion."
          style={[tw``, getCircular('Book')]}
        />
        {/* CHOOSING THE TIME */}
        <ListBox
          style={tw`mb-3`}
          paddingSides={true}
          padding={true}
          border={true}
          textChild={<CrashTimeChild time={'Start time'} />}
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
            setPickerSource('editCrashRecord');
            setPickerVisible(!pickerVisible);
          }}
          headerText="Total time"
          placeholderText="Total time not set, please select total time"
          value={selectedTimeFrame!.name}
          rightComponent={<ChevronDown size={16} color="#d4d4d8" />}
        />
        {/* SEVERITY SLIDER */}
        <ScrollView scrollEnabled={false}>
          <ZeroFiveScaleSlider
            headerText="Severity (optional)"
            sliderStartText="No severity/least severe"
            sliderEndText="Most severe"
            setValue={setSliderValue}
            style={tw`flex-1`}
            padding={true}
            initialValue={sliderValue}
            headerTextStyle={[getCircular('Book'), tw``]}
            sliderTextStyle={[getCircular('Book'), tw``]}
          />
        </ScrollView>
        {/* NOTES */}
        <InputField
          padding={true}
          inputBackgroundColor="bg-white"
          multiline={true}
          value={notes}
          onChangeText={onNotesChange}
          headerText="Notes on this crash (optional)"
          placeholderText="Enter notes here..."
          style={[tw``, getCircular('Book')]}
        />
        {/* PICKER FOR LENGTH OF THE CRASH */}
        {pickerVisible && pickerSource === 'editCrashRecord' && (
          <PickerOverlaySheet
            items={timeFrames}
            selectedItem={selectedTimeFrame}
            setSelectedItem={setSelectedTimeFrame}
            labelKey="name"
            portalHost={'editCrashRecord'}
          />
        )}
      </AppBodyLayout>
    </>
  );
};

export default EditCrashRecord;
