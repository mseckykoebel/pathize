import React, {Dispatch, SetStateAction, useEffect, useState} from 'react';
import {Text} from 'react-native';
import {trigger} from 'react-native-haptic-feedback';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import {usePostHog} from 'posthog-react-native';
import tw from 'twrnc';

import {
  ChevronRight,
  DangerButton,
  Header1,
  InputField,
  InputFieldReadOnly,
  ListBox,
  Loading,
  PrimaryButton,
  ToggleSwitch,
} from '@pathize/mobile-ui';
import {UserMedication, UserSymptom} from '@pathize/db';
import {useAnalytics, useHandleLoadingError} from '../../hooks';
import {CheckInNavigatorParamList} from './CheckInsNavigator';
import {ProfileScreenParamList} from '../profile/ProfileScreenNavigator';
import {useAuth} from '../../CoreNav';
import {
  getUserMedicationsById,
  getUserSymptomsById,
} from '../../features/checkIns';
import {AppBodyLayout, SheetNavbar} from '../../components';
import {getCircular} from '../../utils';
import {useCheckInsContext} from '../../contexts';
import {twoButtonAlert} from '../../lib';

function randomPlaceholder(): string {
  const p1 = 'Morning medications';
  const p2 = 'Evening check-in';
  const p3 = 'Afternoon check-in';
  const p4 = 'Daily symptoms';
  return [p1, p2, p3, p4][Math.floor(Math.random() * 4)];
}

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

// handle generic toggling
const toggleSwitch = (switcher: Dispatch<SetStateAction<boolean>>) =>
  switcher(previousState => !previousState);

const ToggleSwitchChild: React.FC<{
  switcher: Dispatch<SetStateAction<boolean>>;
  value: boolean;
}> = ({switcher, value}) => {
  return (
    <ToggleSwitch
      isEnabled={value}
      onValueChange={() => {
        trigger('impactLight');
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

type Props = StackScreenProps<CheckInNavigatorParamList, 'EditCheckIn'>;

const EditCheckIn: React.FC<Props> = ({route}) => {
  const {checkIn, medications, symptoms} = route.params;
  const {
    updateCheckIn,
    updateCheckInError,
    updateCheckInLoading,
    deleteCheckIn,
    deleteCheckInError,
    deleteCheckInLoading,
  } = useCheckInsContext();
  const {accessToken} = useAuth();

  const profileNavigation =
    useNavigation<
      StackNavigationProp<ProfileScreenParamList, 'UserCheckIns'>
    >();
  const checkInNavigation =
    useNavigation<
      StackNavigationProp<CheckInNavigatorParamList, 'EditCheckIn'>
    >();
  const posthog = usePostHog();
  const isFocused = useIsFocused();
  const {interactionEvent} = useAnalytics();

  // new state
  const [checkInName, setCheckInName] = useState(checkIn.name);
  const [checkInTime, setCheckInTime] = useState(new Date(checkIn.time));
  const [modifiedMedications, setModifiedMedications] = useState<
    UserMedication[] | null
  >(null);
  const [modifiedSymptoms, setModifiedSymptoms] = useState<
    UserSymptom[] | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [notificationsEnabledToggle, setNotificationsEnabledToggle] =
    useState<boolean>(checkIn.notificationsEnabled);

  // close press and errors
  const handleClosePress = () => profileNavigation.navigate('UserCheckIns');
  useHandleLoadingError(
    updateCheckInError,
    updateCheckInLoading,
    handleClosePress,
  );
  useHandleLoadingError(
    deleteCheckInError,
    deleteCheckInLoading,
    handleClosePress,
  );

  useEffect(() => {
    /**
     * @description loads the medications and symptoms that correspond to the check-in medications and symptoms
     */
    const init = async () => {
      // if initial medications
      if (medications) {
        setModifiedMedications(medications);
      } else {
        setLoading(true);
        const medicationIds: string[] = checkIn.medications.map(
          medication => medication.userMedicationId,
        );
        const medicationsFromDb = await getUserMedicationsById(
          medicationIds,
          accessToken,
        );

        if (medicationsFromDb.success) {
          setModifiedMedications(medicationsFromDb.data as UserMedication[]);
        } else {
          setModifiedMedications(null);
        }

        setLoading(false);
      }

      // if initial symptoms
      if (symptoms) {
        setModifiedSymptoms(symptoms);
      } else {
        const symptomIds: string[] = checkIn.symptoms.map(
          symptom => symptom.userSymptomId,
        );
        setLoading(true);

        const symptomsFromDb = await getUserSymptomsById(
          symptomIds,
          accessToken,
        );

        if (symptomsFromDb.success) {
          setModifiedSymptoms(symptomsFromDb.data as UserSymptom[]);
        } else {
          setModifiedSymptoms(null);
        }

        setLoading(false);
      }
    };

    // is focused to re-run when navigated to from a different edit screen
    if (isFocused) {
      init();
    }
  }, [
    accessToken,
    checkIn.medications,
    checkIn.symptoms,
    isFocused,
    medications,
    symptoms,
  ]);

  return (
    <>
      <SheetNavbar
        onClose={() => profileNavigation.navigate('UserCheckIns')}
        posthog={posthog}
        screenName="EditCheckIn"
      />
      <AppBodyLayout
        dismissKeyboardOnTouch={true}
        scrollable={true}
        avoidKeyboard={false}
        padding={false}
        paddingSides={true}
        navigator={checkInNavigation}
        swipeToDismiss={true}
        route="UserCheckIns"
        backgroundColor="bg-white"
        absoluteBottomChild={
          <>
            <PrimaryButton
              text="Save"
              rounded="small"
              width="half"
              loading={updateCheckInLoading}
              padding={false}
              onPress={async () => {
                interactionEvent('Button', 'Pressed', {
                  $screen_name: 'EditCheckIn',
                  value: 'Save',
                });

                // get the checkInIds and the ids for the user symptoms and user medications
                const checkInId = checkIn.id;
                const userMedicationIds = modifiedMedications
                  ? modifiedMedications.map(medication => medication.id)
                  : [];
                const userSymptomIds = modifiedSymptoms
                  ? modifiedSymptoms.map(symptom => symptom.id)
                  : [];

                updateCheckIn(
                  checkInId,
                  checkInName,
                  checkInTime,
                  notificationsEnabledToggle,
                  userMedicationIds,
                  userSymptomIds,
                );
              }}
              disabled={checkInName === '' ? true : false}
              textStyle={[getCircular('Bold'), tw``]}
            />
            <DangerButton
              text="Delete this check-in"
              rounded="small"
              width="half"
              padding={true}
              loading={deleteCheckInLoading}
              onPress={() => {
                twoButtonAlert(
                  'Delete check-in',
                  'Are you sure you want to delete this check-in? This action cannot be undone.',
                  'Cancel',
                  'Yes, delete',
                  () => deleteCheckIn(checkIn.id),
                  posthog,
                );
              }}
              textStyle={[getCircular('Bold'), tw``]}
            />
          </>
        }>
        {/* HEADER */}
        <Header1
          text={`Editing ${checkInName}`}
          style={[
            tw`text-slate-900 text-2xl font-bold leading-8`,
            getCircular('Bold'),
          ]}
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
            trigger('impactLight');
            interactionEvent('Button', 'Pressed', {
              $screen_name: 'EditCheckIn',
              value: checkInName,
            });
          }}
          style={[tw``, getCircular('Book')]}
        />
        {/* NOTIFICATIONS ENABLED */}
        <ListBox
          paddingSides={false}
          border={false}
          textChild={<LeftTextChild text="Notifications enabled" />}
          rightChild={
            <ToggleSwitchChild
              switcher={setNotificationsEnabledToggle}
              value={notificationsEnabledToggle}
            />
          }
        />
        {/* NOTIFICATION TIME */}
        <ListBox
          style={tw``}
          paddingSides={true}
          padding={true}
          border={true}
          textChild={<ActivityTimeChild time={'Notification time'} />}
          rightChild={
            <DateTimePicker
              onChange={(e, d) => {
                if (!d) return;
                setCheckInTime(d);
              }}
              mode="time"
              value={checkInTime}
            />
          }
        />

        {/* MEDICATION CHANGE MULTI-SELECT */}
        <InputFieldReadOnly
          style={[tw``, getCircular('Book')]}
          inputBackgroundColor="bg-white"
          borderAlways={true}
          padding={true}
          onFocus={() => {
            trigger('impactLight');
            interactionEvent('Button', 'Pressed', {
              $screen_name: 'EditCheckIn',
              value:
                modifiedMedications && modifiedMedications.length > 0
                  ? `Modify one of ${modifiedMedications.length} medication${
                      modifiedMedications.length > 1 ? 's' : ''
                    }`
                  : 'Modify medications',
            });

            checkInNavigation.navigate('EditCheckInMedications', {
              checkIn: checkIn,
              medications: modifiedMedications ?? undefined,
            });
          }}
          headerText="Medications"
          value={
            modifiedMedications && modifiedMedications.length > 0
              ? `Modify one of ${modifiedMedications.length} medication${
                  modifiedMedications.length > 1 ? 's' : ''
                }`
              : 'Modify medications'
          }
          rightComponent={<ChevronRight size={16} color="#d4d4d8" />}
        />
        {/* SYMPTOM CHANGE MULTI-SELECT */}
        <InputFieldReadOnly
          style={[tw``, getCircular('Book')]}
          inputBackgroundColor="bg-white"
          borderAlways={true}
          padding={true}
          onFocus={() => {
            trigger('impactLight');
            interactionEvent('Button', 'Pressed', {
              $screen_name: 'EditCheckIn',
              value:
                modifiedSymptoms && modifiedSymptoms.length > 0
                  ? `Modify one of ${modifiedSymptoms.length} symptom${
                      modifiedSymptoms.length > 1 ? 's' : ''
                    }`
                  : 'Modify symptoms',
            });

            checkInNavigation.navigate('EditCheckInSymptoms', {
              checkIn: checkIn,
              symptoms: modifiedSymptoms ?? undefined,
            });
          }}
          headerText="Symptoms"
          value={
            modifiedSymptoms && modifiedSymptoms.length > 0
              ? `Modify one of ${modifiedSymptoms.length} symptom${
                  modifiedSymptoms.length > 1 ? 's' : ''
                }`
              : 'Modify symptoms'
          }
          rightComponent={<ChevronRight size={16} color="#d4d4d8" />}
        />
        {/* LOADING AREA */}
        <Loading loading={loading} padding={true} />
      </AppBodyLayout>
    </>
  );
};

export default EditCheckIn;
