import React, {useState} from 'react';
import {Alert, View} from 'react-native';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import {trigger} from 'react-native-haptic-feedback';
import {usePostHog} from 'posthog-react-native';
import tw from 'twrnc';

import {AppBodyLayout} from '../../../components/layouts';
import {PickerOverlaySheet, SheetNavbar} from '../../../components/sheets';
import {getCircular} from '../../../utils';
import {ProfileScreenParamList} from '../../../screens/profile/ProfileScreenNavigator';
import {MedicationNavigatorParamList} from '../../../screens/medications/MedicationsNavigator';
import {useOverlayContext} from '../../../contexts';
import {
  ChevronDown,
  Divider,
  Header1,
  InputField,
  InputFieldReadOnly,
  PrimaryButton,
} from '@pathize/mobile-ui';
import {useAnalytics} from '../../../hooks';

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
  'NewUserMedicationType'
>;

const NewUserMedicationType: React.FC<Props> = ({route}) => {
  const {medication} = route.params;
  const {pickerVisible, setPickerVisible, pickerSource, setPickerSource} =
    useOverlayContext();

  // type, strength, units
  const [selectedType, setSelectedType] = useState<{
    id: string;
    name: string;
  } | null>(medicationTypes[0]);
  const [strength, setStrength] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<{
    id: string;
    name: string;
  } | null>(units[0]);

  const profileNavigation =
    useNavigation<
      StackNavigationProp<ProfileScreenParamList, 'UserMedications'>
    >();
  const medicationNavigation =
    useNavigation<
      StackNavigationProp<
        MedicationNavigatorParamList,
        'NewUserMedicationSearch'
      >
    >();
  const {interactionEvent} = useAnalytics();
  const posthog = usePostHog();

  return (
    <>
      <SheetNavbar
        onClose={() => profileNavigation.navigate('UserMedications')}
        posthog={posthog}
        screenName="UserMedications"
        navigation={medicationNavigation}
      />
      <AppBodyLayout
        dismissKeyboardOnTouch={true}
        scrollable={false}
        avoidKeyboard={true}
        paddingSides={true}
        navigator={medicationNavigation}
        swipeToDismiss={true}
        route="UserMedications"
        backgroundColor="bg-white">
        {/* INPUT AREA FOR CHOOSING LIMIT */}
        {/* HEADER */}
        <Header1
          text="Select this medication's type, strength, and kind"
          style={[tw`text-slate-900 text-2xl font-bold `, getCircular('Bold')]}
        />
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
        {/* BOTTOM CONTINUE AREA */}
        <View style={tw`flex-1 justify-end`}>
          <PrimaryButton
            padding={false}
            width="half"
            rounded="small"
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
                value: 'Continue',
              });

              medicationNavigation.navigate('NewUserMedicationConfirm', {
                medication: {
                  ...medication,
                  type: selectedType?.name as string,
                  unit: selectedUnit?.name as string,
                  strength: Number(strength),
                },
              });
            }}
            text="Continue"
            disabled={strength === '' || !selectedUnit}
            textStyle={[tw``, getCircular('Bold')]}
          />
        </View>
      </AppBodyLayout>
    </>
  );
};

export default NewUserMedicationType;
