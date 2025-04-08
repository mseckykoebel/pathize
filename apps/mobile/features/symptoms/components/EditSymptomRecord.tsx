import React, {useState} from 'react';
import {ScrollView} from 'react-native';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useNavigation} from '@react-navigation/native';
import {usePostHog} from 'posthog-react-native';
import dayjs from 'dayjs';
import tw from 'twrnc';

import {HomeStackScreenParamList} from '../../../CoreNav';
import {useSymptomsContext} from '../../../contexts/SymptomsContext';
import {Text} from 'react-native';
import {getCircular} from '../../../utils';
import {AppBodyLayout} from '../../../components/layouts';
import {twoButtonAlert} from '../../../lib';
import {SheetNavbar} from '../../../components/sheets/SheetNavbar';
import {SymptomNavigatorParamList} from '../../../screens/symptoms/SymptomNavigator';
import {useAnalytics, useHandleLoadingError} from '../../../hooks';
import {
  DangerButton,
  Header1,
  ListBox,
  PrimaryButton,
  ZeroFiveScaleSlider,
} from '@pathize/mobile-ui';

const SymptomTimeChild: React.FC<{time: string}> = ({time}) => {
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

type Props = StackScreenProps<SymptomNavigatorParamList, 'EditSymptomRecord'>;

const EditSymptomRecord: React.FC<Props> = ({route}) => {
  const {id, severity: initialSymptomSeverity, time} = route.params.symptom;
  const {
    updateSymptomRecord,
    updateSymptomRecordLoading,
    updateSymptomRecordError,
    deleteSymptomRecord,
    deleteSymptomRecordLoading,
    deleteSymptomRecordError,
  } = useSymptomsContext();
  const {interactionEvent} = useAnalytics();
  const posthog = usePostHog();

  const [sliderValue, setSliderValue] = useState<number>(
    initialSymptomSeverity ?? 0,
  );
  const [date, setDate] = useState<Date>(dayjs(time).toDate());
  const homeNavigation =
    useNavigation<StackNavigationProp<HomeStackScreenParamList, 'Symptoms'>>();

  const handleClosePress = () => homeNavigation.navigate('Home');
  useHandleLoadingError(
    updateSymptomRecordError,
    updateSymptomRecordLoading,
    handleClosePress,
  );
  useHandleLoadingError(
    deleteSymptomRecordError,
    deleteSymptomRecordLoading,
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
        dismissKeyboardOnTouch={false}
        scrollable={true}
        padding={false}
        paddingSides={true}
        navigator={homeNavigation}
        swipeToDismiss={true}
        route="Home"
        backgroundColor="bg-white"
        absoluteBottomChild={
          <>
            <PrimaryButton
              text="Save"
              rounded="small"
              width="half"
              loading={updateSymptomRecordLoading}
              padding={false}
              onPress={() => {
                interactionEvent('Button', 'Pressed', {
                  $screen_name: 'ConfirmNewSymptomRecord',
                  value: 'Save',
                });

                updateSymptomRecord(id, date, sliderValue);
              }}
              textStyle={[getCircular('Bold'), tw``]}
            />
            <DangerButton
              text="Delete this symptom"
              rounded="small"
              width="half"
              padding={true}
              loading={deleteSymptomRecordLoading}
              onPress={() => {
                twoButtonAlert(
                  'Delete symptom',
                  'Are you sure you want to delete this symptom record? This action cannot be undone.',
                  'Cancel',
                  'Yes, delete',
                  async () => await deleteSymptomRecord(id),
                  posthog,
                );
              }}
              textStyle={[getCircular('Bold'), tw``]}
            />
          </>
        }>
        {/* HEADER */}
        <Header1
          text={'Editing symptom record'}
          style={[tw`text-slate-900 text-2xl font-bold `, getCircular('Bold')]}
        />
        {/* EDITING THE TIME */}
        <ListBox
          style={tw`mb-3`}
          paddingSides={true}
          padding={true}
          border={true}
          textChild={<SymptomTimeChild time={'Start time'} />}
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
        {/* SEVERITY SLIDER */}
        <ScrollView scrollEnabled={false}>
          <ZeroFiveScaleSlider
            headerText="Severity (optional)"
            sliderStartText="No symptoms/least severe"
            sliderEndText="Most severe"
            setValue={setSliderValue}
            style={tw`flex-1`}
            padding={true}
            initialValue={initialSymptomSeverity ?? 0}
            headerTextStyle={[getCircular('Book'), tw``]}
            sliderTextStyle={[getCircular('Book'), tw``]}
          />
        </ScrollView>
      </AppBodyLayout>
    </>
  );
};

export default EditSymptomRecord;
