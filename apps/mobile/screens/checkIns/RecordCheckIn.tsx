import React, {Dispatch, SetStateAction, useEffect, useState} from 'react';
import {ScrollView, Text, View} from 'react-native';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import {usePostHog} from 'posthog-react-native';
import tw from 'twrnc';

import {
  CheckBox,
  Header1,
  ListBox,
  PrimaryButton,
  Subheader,
  ToggleSwitch,
  ZeroFiveScaleSlider,
} from '@pathize/mobile-ui';
import {SymptomRecord} from '@pathize/db';
import {AppBodyLayout, SheetNavbar} from '../../components';
import {CheckInNavigatorParamList} from './CheckInsNavigator';
import {HomeStackScreenParamList, useAuth} from '../../CoreNav';
import {getCircular} from '../../utils';
import {useAnalytics, useHandleLoadingError} from '../../hooks';
import {useCheckInsContext} from '../../contexts';
import {getSymptomsMostRecentAnswers} from '../../features/symptoms';
import {oneButtonAlert} from '../../lib';

const RightChild: React.FC<{medicationName: string}> = ({medicationName}) => {
  return (
    <Subheader
      style={[getCircular('Medium'), tw`flex flex-row flex-wrap`]}
      breakWords={true}
      textColor="zinc"
      textType="medium"
      text={medicationName}
    />
  );
};
const toggleSwitch = (switcher: Dispatch<SetStateAction<boolean>>) =>
  switcher(previousState => !previousState);

const ToggleSwitchChild: React.FC<{
  switcher: Dispatch<SetStateAction<boolean>>;
  onSwitch?: () => void;
  value: boolean;
}> = ({switcher, onSwitch, value}) => {
  return (
    <ToggleSwitch
      isEnabled={value}
      onValueChange={() => {
        onSwitch && onSwitch();
        toggleSwitch(switcher);
      }}
    />
  );
};

const LeftTextChild: React.FC<{text: string}> = ({text}) => {
  return (
    <Text
      style={[
        getCircular('Book'),
        tw`h-6 text-black text-opacity-80 text-base leading-tight`,
      ]}>
      {text}
    </Text>
  );
};

type Props = StackScreenProps<CheckInNavigatorParamList, 'RecordCheckIn'>;

const RecordCheckIn: React.FC<Props> = ({route}) => {
  const [sliderValues, setSliderValues] = useState<{
    [key: string]: number;
  }>({});
  // const [medicationValues, setMedicationValues] = useState<{
  //   [key: string]: boolean;
  // }>({});

  const [useMostRecent, setUseMostRecent] = useState<boolean>(false);

  const homeNavigation =
    useNavigation<
      StackNavigationProp<HomeStackScreenParamList, 'RecordCheckIn'>
    >();

  const {interactionEvent} = useAnalytics();
  const {recordCheckIn, recordCheckInLoading, recordCheckInError} =
    useCheckInsContext();
  const {userId, accessToken} = useAuth();
  const posthog = usePostHog();

  const handleClosePress = () => homeNavigation.navigate('Home');
  useHandleLoadingError(
    recordCheckInError,
    recordCheckInLoading,
    handleClosePress,
  );

  const handleSliderChange = (symptomId: string, value: number) => {
    setSliderValues(prevValues => ({
      ...prevValues,
      [symptomId]: value,
    }));
  };
  // const handleTogglePress = (medicationId: string, value: boolean) => {
  //   setMedicationValues(prevValues => ({
  //     ...prevValues,
  //     [medicationId]: value,
  //   }));
  // };

  /**
   * @description handle a case where route.params is undefined
   */
  useEffect(() => {
    if (!route.params) {
      homeNavigation.goBack();
    }

    // TODO: show some sort of loading state here
    const getMostRecent = async () => {
      if (!useMostRecent) {
        // for each symptom, set the slider value to 0
        const newSliderValues: {[key: string]: number} = {};
        route.params?.symptoms.forEach(s => {
          newSliderValues[s.id] = 0;
        });
        setSliderValues(newSliderValues);
        return;
      }

      const symptoms = await getSymptomsMostRecentAnswers(userId, accessToken);
      if (!symptoms.success) {
        oneButtonAlert(
          'Issue loading most recent symptoms',
          'We ran into an issue loading your most recent symptoms. Please try again later.',
        );

        setUseMostRecent(false);
        return;
      }

      const newSliderValues: {[key: string]: number} = {};
      (symptoms.data as SymptomRecord[]).forEach(s => {
        newSliderValues[s.userSymptomId as string] = s.severity
          ? s.severity
          : 0;
      });

      setSliderValues(newSliderValues);
    };

    getMostRecent();
  }, [route.params, homeNavigation, userId, accessToken, useMostRecent]);

  const {checkIn, medications, symptoms} = route.params || {
    checkIn: null,
    medications: [],
    symptoms: [],
  };

  const renderSliders = () => {
    return symptoms.map(s => {
      return (
        <ZeroFiveScaleSlider
          key={`${s.id}`}
          headerText={`Severity for ${s.name!.toLowerCase()}`}
          sliderStartText="No symptoms/least severe"
          sliderEndText="Most severe"
          initialValue={sliderValues[s.id]}
          setValue={value => {
            handleSliderChange(s.id, value);
          }}
          style={tw`flex-1`}
          padding={true}
          headerTextStyle={[getCircular('Book'), tw``]}
          sliderTextStyle={[getCircular('Book'), tw``]}
        />
      );
    });
  };

  const renderMedications = () => {
    return medications.map(m => {
      return (
        <View key={m.id} style={[tw`flex flex-row items-center`]}>
          <CheckBox style={tw`mr-3`} checked={true} touchesEnabled={false} />
          <RightChild medicationName={m.medicationName as string} />
        </View>
      );
    });
  };

  return (
    <>
      <SheetNavbar
        onClose={() => homeNavigation.navigate('Home')}
        posthog={posthog}
        screenName="EditCheckIn"
      />
      <AppBodyLayout
        dismissKeyboardOnTouch={true}
        scrollable={true}
        avoidKeyboard={false}
        padding={false}
        paddingSides={true}
        navigator={homeNavigation}
        swipeToDismiss={true}
        route="RecordCheckIn"
        backgroundColor="bg-white"
        absoluteBottomChild={
          <PrimaryButton
            text={
              medications?.length === 0 && symptoms?.length === 0
                ? 'Close'
                : 'Save'
            }
            rounded="small"
            width="half"
            loading={recordCheckInLoading}
            padding={false}
            onPress={async () => {
              if (medications?.length === 0 && symptoms?.length === 0) {
                handleClosePress();
                return;
              }

              interactionEvent('Button', 'Pressed', {
                $screen_name: 'RecordCheckIn',
                value:
                  medications?.length === 0 && symptoms?.length === 0
                    ? 'Close'
                    : 'Save',
              });

              /**
               * TODO: currently we default all medications to being taken
               * this is so we know what check-ins have been recorded
               * better way to mark check-ins as being recorded that
               * does not involve this
               */
              const medicationsToRecord = medications;

              const symptomsToRecord = symptoms?.map(s => ({
                ...s,
                severity: sliderValues[s.id],
              }));

              return await recordCheckIn(
                checkIn?.id,
                symptomsToRecord ?? undefined,
                medicationsToRecord ?? undefined,
              );
            }}
            textStyle={[getCircular('Bold'), tw``]}
            style={[tw`mt-3`]}
          />
        }>
        {/* HEADER */}
        <Header1
          text={`Recording check-in: ${checkIn?.name}`}
          style={[
            tw`text-slate-900 text-2xl font-bold leading-8 mb-3`,
            getCircular('Bold'),
          ]}
        />
        {/* IF NO MEDICATIONS AND NO SYMPTOMS */}
        {symptoms?.length === 0 && medications?.length === 0 ? (
          <Subheader
            text={
              'You have no medications or symptoms associated with this check-in.'
            }
            style={[getCircular('Book'), tw`mt-4 mb-2`, getCircular('Book')]}
          />
        ) : null}
        {/* IF SYMPTOMS */}
        {symptoms?.length > 0 ? (
          <>
            {/* USE PREVIOUS ANSWERS */}
            <ListBox
              paddingSides={false}
              border={false}
              textChild={<LeftTextChild text="Use most recent" />}
              rightChild={
                <ToggleSwitchChild
                  switcher={setUseMostRecent}
                  onSwitch={() => {
                    interactionEvent('Switch', 'Toggled', {
                      $screen_name: 'RecordCheckIn',
                      value: useMostRecent,
                    });
                  }}
                  value={useMostRecent}
                />
              }
            />
            {/* SLIDERS */}
            <Subheader
              text={'Select the severities for this check-ins symptom(s).'}
              style={[getCircular('Book'), tw`mt-3 mb-2`, getCircular('Book')]}
            />
            <ScrollView scrollEnabled={false}>{renderSliders()}</ScrollView>
          </>
        ) : null}
        {/* IF MEDICATIONS */}
        {medications?.length > 0 ? (
          <>
            <Subheader
              text={'The medication(s) below will be recorded as being taken.'}
              style={[getCircular('Book'), tw`mt-4 mb-2`, getCircular('Book')]}
            />
            {renderMedications()}
          </>
        ) : null}
      </AppBodyLayout>
    </>
  );
};

export default RecordCheckIn;
