import React, {useState} from 'react';
import {Text, ScrollView} from 'react-native';
import {SheetNavbar} from '../../../components/sheets/SheetNavbar';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import {trigger} from 'react-native-haptic-feedback';
import {usePostHog} from 'posthog-react-native';
import advancedformat from 'dayjs/plugin/advancedFormat';
import dayjs from 'dayjs';
import tw from 'twrnc';

dayjs.extend(advancedformat);

import {AppBodyLayout} from '../../../components/layouts';
import {HomeStackScreenParamList} from '../../../CoreNav';
import {
  useTodayDataContext,
  useCrashesContext,
  useOverlayContext,
} from '../../../contexts';
import {getCircular} from '../../../utils';
import {stringTimeToNumber} from '../../../lib';
import {CrashNavigatorParamList} from '../../../screens/crashes/CrashNavigator';
import {
  ChevronDown,
  Header1,
  InputField,
  InputFieldReadOnly,
  ListBox,
  PrimaryButton,
  Subheader,
  ZeroFiveScaleSlider,
} from '@pathize/mobile-ui';
import {timeFrames} from '../../../data';
import {PickerOverlaySheet} from '../../../components/sheets';
import {useAnalytics, useHandleLoadingError} from '../../../hooks';

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

type Props = StackScreenProps<CrashNavigatorParamList, 'NewCrashRecord'>;

const NewCrashRecord: React.FC<Props> = () => {
  const {pickerVisible, setPickerVisible, pickerSource, setPickerSource} =
    useOverlayContext();
  const {
    createCrashRecord,
    createCrashLoading: loading,
    createCrashError: error,
  } = useCrashesContext();

  const [selectedTimeFrame, setSelectedTimeFrame] = useState<{
    id: string;
    name: string;
  } | null>(timeFrames[0]);
  const [sliderValue, setSliderValue] = useState(0);

  const [date, setDate] = useState(new Date());
  const [notes, onNotesChange] = useState('');
  const {today} = useTodayDataContext();
  const homeNavigation =
    useNavigation<StackNavigationProp<HomeStackScreenParamList, 'Crashes'>>();
  const {interactionEvent} = useAnalytics();
  const posthog = usePostHog();
  const handleClosePress = () => homeNavigation.navigate('Home');
  useHandleLoadingError(error, loading, handleClosePress);

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
          <PrimaryButton
            text="Save"
            rounded="small"
            width="half"
            loading={loading}
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

              await createCrashRecord(
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
                today,
                notes,
              );
            }}
            disabled={false}
            textStyle={[getCircular('Bold'), tw``]}
          />
        }>
        {/* HEADER */}
        <Header1
          paddingBottom={true}
          text={`Recording a crash/PEM for ${dayjs(today).format('MMMM Do')}`}
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
          padding={false}
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
            setPickerSource('newCrashRecord');
            setPickerVisible(!pickerVisible);
          }}
          headerText="Total time"
          placeholderText="Total time not set, please select a total time"
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
        {/* PICKER IS VISIBLE FOR TYPE AND UNITS */}
        {pickerVisible && pickerSource === 'newCrashRecord' && (
          <PickerOverlaySheet
            items={timeFrames}
            selectedItem={selectedTimeFrame}
            setSelectedItem={setSelectedTimeFrame}
            labelKey="name"
            portalHost={'newCrashRecord'}
          />
        )}
      </AppBodyLayout>
    </>
  );
};

export default NewCrashRecord;
