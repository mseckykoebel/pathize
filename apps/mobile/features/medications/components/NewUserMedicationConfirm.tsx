import React, {useState} from 'react';
import {View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import {usePostHog} from 'posthog-react-native';
import tw from 'twrnc';

import {AppBodyLayout} from '../../../components/layouts';
import {SheetNavbar} from '../../../components/sheets';
import {useMedicationsContext} from '../../../contexts';
import {MedicationNavigatorParamList} from '../../../screens/medications/MedicationsNavigator';
import {ProfileScreenParamList} from '../../../screens/profile/ProfileScreenNavigator';
import {useAnalytics, useHandleLoadingError} from '../../../hooks';
import {Header1, PrimaryButton, InputField} from '@pathize/mobile-ui';
import {getCircular} from '../../../utils';

type Props = StackScreenProps<
  MedicationNavigatorParamList,
  'NewUserMedicationConfirm'
>;

const NewUserMedicationConfirm: React.FC<Props> = ({route}) => {
  const {medicationId, medicationName, type, unit, strength} =
    route.params.medication;
  const {
    createUserMedication,
    createUserMedicationLoading: loading,
    createUserMedicationError: error,
  } = useMedicationsContext();

  const [medicationNotes, setMedicationNotes] = useState('');
  const profileNavigation =
    useNavigation<
      StackNavigationProp<ProfileScreenParamList, 'UserMedications'>
    >();
  const medicationNavigation =
    useNavigation<
      StackNavigationProp<
        MedicationNavigatorParamList,
        'NewUserMedicationConfirm'
      >
    >();
  const {interactionEvent} = useAnalytics();
  const posthog = usePostHog();

  const handleClosePress = () => profileNavigation.navigate('UserMedications');
  useHandleLoadingError(error, loading, handleClosePress);

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
        avoidKeyboard={false}
        padding={false}
        paddingSides={true}
        navigator={medicationNavigation}
        swipeToDismiss={true}
        route="UserMedications"
        backgroundColor="bg-white">
        <View>
          {/* HEADER (MODIFIED) */}
          <Header1
            text="Make sure everything looks good!"
            style={[
              tw`text-slate-900 text-2xl font-bold leading-8`,
              getCircular('Bold'),
            ]}
          />
          {/* TEXT INPUT */}
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
        </View>
        {/* CONTINUE AREA */}
        <View style={tw`flex-1 justify-end`}>
          <PrimaryButton
            text="Save"
            padding={false}
            rounded={'small'}
            width={'half'}
            loading={loading}
            onPress={async () => {
              interactionEvent('Button', 'Pressed', {
                $screen_name: 'UserMedications',
                value: 'Save',
              });

              return await createUserMedication(
                medicationId,
                medicationName!,
                type,
                unit!,
                strength!,
                medicationNotes,
              );
            }}
            textStyle={[getCircular('Bold'), tw``]}
          />
        </View>
      </AppBodyLayout>
    </>
  );
};

export default NewUserMedicationConfirm;
