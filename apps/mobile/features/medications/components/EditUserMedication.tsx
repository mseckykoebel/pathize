import React, {useState} from 'react';
import {Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import {trigger} from 'react-native-haptic-feedback';
import {usePostHog} from 'posthog-react-native';
import tw from 'twrnc';

import {getCircular} from '../../../utils';
import {AppBodyLayout} from '../../../components/layouts';
import {PickerOverlaySheet, SheetNavbar} from '../../../components/sheets';
import {twoButtonAlert} from '../../../lib';
import {useMedicationsContext, useOverlayContext} from '../../../contexts';
import {ProfileScreenParamList} from '../../../screens/profile/ProfileScreenNavigator';
import {MedicationNavigatorParamList} from '../../../screens/medications/MedicationsNavigator';
import {
  ChevronDown,
  DangerButton,
  Divider,
  Header1,
  InputField,
  InputFieldReadOnly,
  PrimaryButton,
} from '@pathize/mobile-ui';
import {useAnalytics, useHandleLoadingError} from '../../../hooks';

export const medicationTypes = [
  {id: '0', name: 'Capsule'},
  {id: '1', name: 'Cream'},
  {id: '2', name: 'Device'},
  {id: '3', name: 'Drops'},
  {id: '4', name: 'Foam'},
  {id: '5', name: 'Gel'},
  {id: '6', name: 'Inhaler'},
  {id: '7', name: 'Inhalation Solution'},
  {id: '8', name: 'Injection'},
  {id: '9', name: 'Liquid'},
  {id: '10', name: 'Lotion'},
  {id: '11', name: 'Nasal Spray'},
  {id: '12', name: 'Ointment'},
  {id: '13', name: 'Patch'},
  {id: '14', name: 'Powder'},
  {id: '15', name: 'Solution for Nebulizer'},
  {id: '16', name: 'Spray'},
  {id: '17', name: 'Suppository'},
  {id: '18', name: 'Tablet'},
  {id: '19', name: 'Topical'},
  {id: '20', name: 'Other/unknown'},
];

export const units = [
  {id: '0', name: 'mg'},
  {id: '1', name: 'mcg'},
  {id: '2', name: 'g'},
  {id: '3', name: 'ml'},
  {id: '4', name: '%'},
  {id: '5', name: 'unit(s)'},
];

type Props = StackScreenProps<
  MedicationNavigatorParamList,
  'EditUserMedication'
>;

const EditUserMedication: React.FC<Props> = ({route}) => {
  const {medication} = route.params;
  const {
    updateUserMedication,
    updateUserMedicationLoading,
    updateUserMedicationError,
    deleteUserMedication,
    deleteUserMedicationLoading,
    deleteUserMedicationError,
  } = useMedicationsContext();
  const {pickerVisible, setPickerVisible, pickerSource, setPickerSource} =
    useOverlayContext();

  const profileNavigation =
    useNavigation<
      StackNavigationProp<ProfileScreenParamList, 'UserMedications'>
    >();
  const {interactionEvent} = useAnalytics();
  const posthog = usePostHog();

  const [selectedType, setSelectedType] = useState<{
    id: string;
    name: string;
  } | null>(
    medicationTypes.find(type => type.name === medication?.type) ?? null,
  );
  const [strength, setStrength] = useState(
    medication?.strength ? medication.strength.toString() : '',
  );
  const [selectedUnit, setSelectedUnit] = useState<{
    id: string;
    name: string;
  } | null>(units.find(unit => unit.name === medication?.unit) ?? null);
  const [medicationNotes, setMedicationNotes] = useState<string>(
    medication?.notes ?? '',
  );
  const [medicationName, setMedicationName] = useState(
    medication?.medicationName || '',
  );

  // process upon successful update or delete
  const handleClosePress = () => profileNavigation.navigate('UserMedications');
  useHandleLoadingError(
    updateUserMedicationError,
    updateUserMedicationLoading,
    handleClosePress,
  );
  useHandleLoadingError(
    deleteUserMedicationError,
    deleteUserMedicationLoading,
    handleClosePress,
  );

  return (
    <>
      <SheetNavbar
        onClose={() => profileNavigation.navigate('UserMedications')}
        posthog={posthog}
        screenName="UserMedications"
        navigation={profileNavigation}
      />
      <AppBodyLayout
        dismissKeyboardOnTouch={true}
        scrollable={true}
        avoidKeyboard={true}
        paddingSides={true}
        navigator={profileNavigation}
        swipeToDismiss={true}
        route="UserMedications"
        backgroundColor="bg-white"
        absoluteBottomChild={
          <>
            <PrimaryButton
              text="Save"
              rounded="small"
              width="half"
              loading={updateUserMedicationLoading}
              padding={false}
              onPress={() => {
                if (
                  isNaN(Number(strength)) ||
                  !selectedUnit ||
                  Number(strength) <= 0
                ) {
                  Alert.alert(
                    'Invalid input',
                    'Please enter a valid strength and unit',
                  );
                  return;
                }

                interactionEvent('Button', 'Pressed', {
                  $screen_name: 'UserMedications',
                  value: medication.medicationName,
                });

                updateUserMedication(
                  medication.id,
                  medicationName,
                  selectedType!.name,
                  Number(strength),
                  selectedUnit!.name,
                  medicationNotes,
                );
              }}
              disabled={medicationName === '' ? true : false}
              textStyle={[getCircular('Bold'), tw``]}
            />
            <DangerButton
              text="Delete"
              rounded="small"
              width="half"
              padding={true}
              loading={deleteUserMedicationLoading}
              onPress={() => {
                twoButtonAlert(
                  'Delete medication+',
                  'Are you sure you want to delete this from your list of medications and supplements? Previous records of you recording this will be kept. This action cannot be undone.',
                  'Cancel',
                  'Yes, delete',
                  () => deleteUserMedication(medication.id),
                  posthog,
                );
              }}
              textStyle={[getCircular('Bold'), tw``]}
            />
          </>
        }>
        {/* HEADER */}
        <Header1
          text={`Editing ${medicationName}`} //TODO might be undefined...
          style={[tw`text-slate-900 text-2xl font-bold`, getCircular('Bold')]}
        />
        {/* EDITING NAME */}
        {!medication?.medicationId && (
          <InputField
            padding={true}
            inputBackgroundColor="bg-white"
            value={medicationName}
            onChangeText={setMedicationName}
            headerText="Name of this medication"
            placeholderText="Enter name here..."
            style={[tw``, getCircular('Book')]}
          />
        )}
        {/* INPUT FOR TYPE */}
        <InputFieldReadOnly
          style={[tw``, getCircular('Book')]}
          inputBackgroundColor="bg-white"
          borderAlways={true}
          padding={true}
          onFocus={() => {
            trigger('impactLight');
            setPickerSource('addNewMedicationType');
            setPickerVisible(!pickerVisible);
          }}
          headerText="Type"
          placeholderText="Type not set, please select a type"
          value={selectedType!.name}
          rightComponent={<ChevronDown size={16} color="#d4d4d8" />}
        />
        {/* DIVIDER */}
        <Divider padding={true} />
        {/* INPUT FOR NUMBER/AMOUNT OF DOSAGE */}
        <InputField
          padding={true}
          inputMode="numeric"
          headerText="Strength"
          inputBackgroundColor="bg-white"
          value={strength}
          onChangeText={setStrength}
          placeholderText="Strength"
          onFocus={() => {
            interactionEvent('Input', 'Focused', {
              $screen_name: 'UserMedications',
              value: strength,
            });
          }}
          style={[tw``, getCircular('Book')]}
        />
        {/* INPUT FOR UNIT PICKER */}
        <InputFieldReadOnly
          style={[tw``, getCircular('Book')]}
          inputBackgroundColor="bg-white"
          borderAlways={true}
          padding={true}
          onFocus={() => {
            setPickerSource('addNewMedicationUnit');
            setPickerVisible(true);
          }}
          headerText="Kind"
          value={selectedUnit!.name}
          rightComponent={<ChevronDown size={16} color="#d4d4d8" />}
        />
        {/* PICKER IS VISIBLE FOR TYPE AND UNITS */}
        {pickerVisible && (
          <PickerOverlaySheet
            items={
              pickerSource === 'addNewMedicationType' ? medicationTypes : units
            }
            selectedItem={
              pickerSource === 'addNewMedicationType'
                ? selectedType
                : selectedUnit
            }
            setSelectedItem={
              pickerSource === 'addNewMedicationType'
                ? setSelectedType
                : setSelectedUnit
            }
            labelKey="name"
            portalHost={
              pickerSource === 'addNewMedicationType'
                ? 'addNewMedicationType'
                : 'addNewMedicationUnit'
            }
          />
        )}
        {/* CHANGING NOTES */}
        <InputField
          padding={true}
          inputBackgroundColor="bg-white"
          multiline={true}
          value={medicationNotes}
          onChangeText={setMedicationNotes}
          headerText="Notes on this (optional)"
          placeholderText="Enter notes here..."
          style={[tw``, getCircular('Book')]}
        />
      </AppBodyLayout>
    </>
  );
};

export default EditUserMedication;
