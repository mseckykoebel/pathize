import React, {useState} from 'react';
import {View, Text, TouchableOpacity, KeyboardAvoidingView} from 'react-native';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faCheck} from '@fortawesome/free-solid-svg-icons';
import {useNavigation} from '@react-navigation/native';
import {usePostHog} from 'posthog-react-native';
import tw from 'twrnc';

import {AppBodyLayout, SwipeDownScrollView} from '../../../components/layouts';
import {SheetNavbar} from '../../../components/sheets';
import {
  DarkButton,
  FormInput,
  H2Text,
  InputText,
  LightButton,
} from '../../../components/elements';
import {getIcon} from '../../../utils';
import {ProfileScreenParamList} from '../../../screens/profile/ProfileScreenNavigator';
import {MedicationNavigatorParamList} from '../../../screens/medications/MedicationsNavigator';

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
  'NewUserMedicationStrength'
>;

const NewUserMedicationStrength: React.FC<Props> = ({route}) => {
  const {medication} = route.params;

  const [strength, setStrength] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<null | string>(null);
  const [error, setError] = useState('');
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
  const posthog = usePostHog();

  const validateTextInputs = () => {
    // ONLY ACCEPT NUMBERS. IF ANYTHING BUT A NUMBER, OR A NEGATIVE NUMBER IS ENTERED, THROW AN ERROR
    if (isNaN(Number(strength)) || !selectedUnit || Number(strength) <= 0) {
      setError('Please enter a valid number');
      setTimeout(() => {
        setError('');
      }, 3000);
      return false;
    }
    return true;
  };

  return (
    <AppBodyLayout rounded={false}>
      <SheetNavbar
        onClose={() => profileNavigation.navigate('UserMedications')}
        posthog={posthog}
        navigation={medicationNavigation}
        screenName="Medications"
      />
      <SwipeDownScrollView
        navigator={profileNavigation}
        route="UserMedications">
        <View style={tw`px-4 pb-5`}>
          <KeyboardAvoidingView>
            <H2Text text="Select it's strength" />
            {/* TOP SECTION IS THE MEDICATION PREVIEW */}
            <View
              style={tw`flex flex-row justify-start items-center p-4 my-2 rounded-md border border-gray-300`}>
              <FontAwesomeIcon
                icon={getIcon('Medication')}
                size={30}
                color="#065f46"
              />
              <View style={tw`flex flex-col`}>
                <Text
                  style={tw`text-base font-bold text-gray-700 ml-4 mr-8 leading-5`}>
                  {medication.medicationName}
                </Text>
                <Text style={tw`text-xs font-normal text-gray-700 ml-4`}>
                  Type: {medication.type.toLowerCase()}
                </Text>
              </View>
            </View>
            {/* AMOUNT INPUT */}
            <View style={tw`mt-1`}>
              <InputText text="Strength" />
              <FormInput
                value={strength}
                onChangeText={setStrength}
                placeholder="Add strength"
                maxLength={5}
                onFocus={() => {
                  posthog?.capture('Medication strength input focused', {
                    $screen_name: 'UserMedications',
                    component: 'FormInput',
                    value: strength,
                  });
                }}
              />
            </View>
            {/* UNIT INPUT */}
            <View style={tw`mt-1`}>
              <InputText text="Unit" />
              <View
                style={tw`mt-1 rounded-md border border-gray-300 h-auto bg-white`}>
                {units.map((unit, id) => (
                  <TouchableOpacity
                    key={id}
                    onPress={() => {
                      posthog?.capture('Medication unit button pressed', {
                        $screen_name: 'UserMedications',
                        component: 'TouchableOpacity',
                        value: unit,
                      });
                      if (selectedUnit === unit) {
                        setSelectedUnit(null);
                      } else {
                        setSelectedUnit(unit);
                      }
                    }}
                    style={tw`flex flex-row justify-between items-center p-3 border-gray-300 ${
                      id !== units.length - 1 ? 'border-b' : 'rounded-b-md'
                    } ${selectedUnit === unit ? '' : ''} 
                  ${id === 0 ? 'rounded-t-md' : ''}
                  `}>
                    <Text style={tw`text-sm font-medium text-gray-700 ml-2`}>
                      {unit}
                    </Text>
                    {selectedUnit && selectedUnit === unit && (
                      <FontAwesomeIcon
                        icon={faCheck}
                        size={20}
                        color="#065f46"
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </KeyboardAvoidingView>
          {error && (
            <View style={tw`flex items-center justify-between pt-4`}>
              <View style={tw`text-sm`}>
                <Text style={tw`font-medium text-red-400`}>{error}</Text>
              </View>
            </View>
          )}
        </View>
      </SwipeDownScrollView>
      <View style={tw`bottom-0 mb-12 items-center bg-white`}>
        <View style={tw`pt-5 w-50 mx-auto`}>
          <DarkButton
            onPress={() => {
              validateTextInputs();
              if (validateTextInputs()) {
                posthog?.capture('Continue button pressed', {
                  $screen_name: 'UserMedications',
                  component: 'DarkButton',
                  value: strength,
                });

                medicationNavigation.navigate('NewUserMedicationConfirm', {
                  medication: {
                    ...medication,
                    unit: selectedUnit as string,
                    strength: Number(strength),
                  },
                });
              }
            }}
            text={'Continue'}
            opacity={strength === '' || !selectedUnit ? 50 : 100}
            disabled={strength === '' || !selectedUnit}
            style={tw`mb-4`}
          />
          <LightButton
            onPress={() => {
              posthog?.capture('Skip button pressed', {
                $screen_name: 'Illnesses',
                component: 'LightButton',
                buttonText: 'Skip',
              });

              medicationNavigation.navigate('NewUserMedicationConfirm', {
                medication: {
                  ...medication,
                  unit: null,
                  strength: null,
                },
              });
            }}
            text={'Skip'}
          />
        </View>
      </View>
    </AppBodyLayout>
  );
};

export default NewUserMedicationStrength;
