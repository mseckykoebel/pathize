import React, {useState} from 'react';
import {Text, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import {usePostHog} from 'posthog-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import advancedformat from 'dayjs/plugin/advancedFormat';
import dayjs from 'dayjs';
import tw from 'twrnc';

dayjs.extend(advancedformat);

import {SymptomNavigatorParamList} from '../../../screens/symptoms/SymptomNavigator';
import {getCircular} from '../../../utils';
import {AppBodyLayout} from '../../../components/layouts';
import {HomeStackScreenParamList} from '../../../CoreNav';
import {useTodayDataContext, useSymptomsContext} from '../../../contexts';
import {SheetNavbar} from '../../../components/sheets';
import {useAnalytics, useHandleLoadingError} from '../../../hooks';
import {
  Header1,
  ListBox,
  PrimaryButton,
  Subheader,
  ZeroFiveScaleSlider,
} from '@pathize/mobile-ui';

const SymptomTimeChild: React.FC<{time: string}> = ({time}) => {
  return (
    <Text
      style={[
        getCircular('Book'),
        tw`h-5 text-black text-opacity-80 text-base leading-tight`,
      ]}>
      {time}
    </Text>
  );
};

type Props = StackScreenProps<
  SymptomNavigatorParamList,
  'ConfirmNewSymptomRecord'
>;

const ConfirmNewSymptom: React.FC<Props> = ({route}) => {
  const {symptoms} = route.params;
  const isArrayOfSymptoms = Array.isArray(symptoms);
  const [date, setDate] = useState(new Date());
  const [sliderValues, setSliderValues] = useState<{
    [key: string]: number;
  }>({});

  const {today} = useTodayDataContext();
  const {
    createSymptomRecord,
    getSymptomRecords,
    createSymptomRecordLoading,
    createSymptomRecordError,
  } = useSymptomsContext();
  const homeNavigation =
    useNavigation<StackNavigationProp<HomeStackScreenParamList, 'Symptoms'>>();
  const {interactionEvent} = useAnalytics();
  const posthog = usePostHog();

  const handleClosePress = () => homeNavigation.navigate('Home');
  const handleSliderChange = (symptomId: string, value: number) => {
    setSliderValues(prevValues => ({
      ...prevValues,
      [symptomId]: value,
    }));
  };

  useHandleLoadingError(
    createSymptomRecordError,
    createSymptomRecordLoading,
    handleClosePress,
  );

  const renderSliders = () => {
    if (isArrayOfSymptoms) {
      return symptoms.map(s => (
        <ZeroFiveScaleSlider
          key={s.id}
          headerText={`Severity for ${s.name!.toLowerCase()} (optional)`}
          sliderStartText="No symptoms/least severe"
          sliderEndText="Most severe"
          initialValue={sliderValues[s.id]}
          setValue={value => handleSliderChange(s.id, value)}
          style={tw`flex-1`}
          padding={true}
          headerTextStyle={[getCircular('Book'), tw``]}
          sliderTextStyle={[getCircular('Book'), tw``]}
        />
      ));
    } else {
      return (
        <ZeroFiveScaleSlider
          headerText={`Severity for ${symptoms.name!.toLowerCase()} (optional)`}
          sliderStartText="No symptoms/least severe"
          sliderEndText="Most severe"
          initialValue={sliderValues[symptoms.id] || 0} // Default value if not set
          setValue={value => handleSliderChange(symptoms.id, value)}
          style={tw`flex-1`}
          padding={true}
          headerTextStyle={[getCircular('Book'), tw``]}
          sliderTextStyle={[getCircular('Book'), tw``]}
        />
      );
    }
  };

  return (
    <>
      <SheetNavbar
        onClose={() => homeNavigation.navigate('Home')}
        posthog={posthog}
        screenName="Home"
        navigation={homeNavigation}
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
          <PrimaryButton
            text="Save"
            rounded="small"
            width="half"
            loading={createSymptomRecordLoading}
            padding={false}
            onPress={async () => {
              interactionEvent('Button', 'Pressed', {
                $screen_name: 'ConfirmNewSymptomRecord',
                value: 'Save',
              });

              if (isArrayOfSymptoms) {
                await Promise.all(
                  symptoms.map(s =>
                    createSymptomRecord(
                      date,
                      today,
                      s.symptomId, // the ID of the static symptom
                      s.id, // the ID of the associated user symptom
                      sliderValues[s.id], // the severity from the sliderValues state
                      s.name!,
                      s.description,
                      s.category!,
                      false,
                    ),
                  ),
                );

                await getSymptomRecords();
              } else {
                await createSymptomRecord(
                  date,
                  today,
                  symptoms.symptomId,
                  symptoms.id,
                  sliderValues[symptoms.id],
                  symptoms.name!,
                  symptoms.description,
                  symptoms.category!,
                  true,
                );
              }
            }}
            textStyle={[getCircular('Bold'), tw``]}
            style={[tw`mt-3`]}
          />
        }>
        {/* HEADER */}
        <Header1
          text={
            isArrayOfSymptoms
              ? `Confirm severity and recording time for your ${
                  symptoms.length
                } symptom${symptoms.length > 1 ? 's' : ''}`
              : 'Confirm severity and recording time'
          }
          paddingBottom={true}
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
          style={tw`mb-3 mt-5`}
          paddingSides={true}
          padding={true}
          border={true}
          textChild={<SymptomTimeChild time={'Recording time'} />}
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
        <ScrollView scrollEnabled={false}>{renderSliders()}</ScrollView>
      </AppBodyLayout>
    </>
  );
};

export default ConfirmNewSymptom;
