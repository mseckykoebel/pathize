import React, {useState} from 'react';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import {usePostHog} from 'posthog-react-native';
import tw from 'twrnc';

import {SymptomNavigatorParamList} from '../../../screens/symptoms/SymptomNavigator';
import {ProfileScreenParamList} from '../../../screens/profile/ProfileScreenNavigator';
import {getCircular, getIcon} from '../../../utils';
import {AppBodyLayout} from '../../../components/layouts';
import {SheetNavbar} from '../../../components/sheets';
import {twoButtonAlert} from '../../../lib';
import {useSymptomsContext} from '../../../contexts';
import {useAnalytics, useHandleLoadingError} from '../../../hooks';
import {
  DangerButton,
  Header1,
  InputField,
  InputFieldReadOnly,
  PathizeIcon,
  PrimaryButton,
} from '@pathize/mobile-ui';

type Props = StackScreenProps<SymptomNavigatorParamList, 'EditUserSymptom'>;

const EditUserSymptom: React.FC<Props> = ({route}) => {
  const {symptom} = route.params;
  const {
    updateUserSymptom,
    updateUserSymptomLoading,
    updateUserSymptomError,
    deleteUserSymptom,
    deleteUserSymptomLoading,
    deleteUserSymptomError,
  } = useSymptomsContext();
  const profileNavigation =
    useNavigation<
      StackNavigationProp<ProfileScreenParamList, 'UserSymptoms'>
    >();
  const symptomNavigation =
    useNavigation<
      StackNavigationProp<SymptomNavigatorParamList, 'EditUserSymptom'>
    >();
  const {interactionEvent} = useAnalytics();
  const posthog = usePostHog();
  // name and notes
  const [symptomNotes, setSymptomNotes] = useState(symptom?.notes || '');
  const [symptomName, setSymptomName] = useState(symptom?.name || '');

  // process upon successful update or delete
  const handleClosePress = () => profileNavigation.navigate('UserSymptoms');
  useHandleLoadingError(
    updateUserSymptomError,
    updateUserSymptomLoading,
    handleClosePress,
  );
  useHandleLoadingError(
    deleteUserSymptomError,
    deleteUserSymptomLoading,
    handleClosePress,
  );

  return (
    <>
      <SheetNavbar
        onClose={() => profileNavigation.navigate('UserSymptoms')}
        posthog={posthog}
        screenName="UserSymptoms"
      />
      <AppBodyLayout
        scrollable={true}
        avoidKeyboard={true}
        padding={false}
        paddingSides={true}
        navigator={symptomNavigation}
        swipeToDismiss={true}
        dismissKeyboardOnTouch={true}
        route="UserSymptoms"
        backgroundColor="bg-white"
        absoluteBottomChild={
          <>
            <PrimaryButton
              text="Save"
              rounded="small"
              width="half"
              loading={updateUserSymptomLoading}
              padding={false}
              onPress={() => {
                interactionEvent('Button', 'Pressed', {
                  $screen_name: 'UserSymptoms',
                  value: 'Save',
                });

                updateUserSymptom(
                  symptom.id,
                  symptom.symptomId,
                  symptom.category as string,
                  symptomName,
                  symptomNotes,
                );
              }}
              disabled={symptomName === '' ? true : false}
              textStyle={[getCircular('Bold'), tw``]}
            />
            <DangerButton
              text="Delete this symptom"
              rounded="small"
              width="half"
              padding={true}
              onPress={() => {
                twoButtonAlert(
                  'Delete symptom',
                  'Are you sure you want to delete this symptom from your list of symptoms? Previous records of you recording this symptom will be kept. This action cannot be undone.',
                  'Cancel',
                  'Yes, delete',
                  () => deleteUserSymptom(symptom.id),
                  posthog,
                );
              }}
              loading={deleteUserSymptomLoading}
              textStyle={[getCircular('Bold'), tw``]}
            />
          </>
        }>
        {/* HEADER */}
        <Header1
          text={`Editing ${symptomName.toLowerCase()}`}
          style={[tw`text-slate-900 text-2xl font-bold `, getCircular('Bold')]}
        />
        {/* EDITING NAME */}
        {!symptom?.symptomId && (
          <InputField
            padding={true}
            inputBackgroundColor="bg-white"
            value={symptomName}
            onChangeText={setSymptomName}
            headerText="Name of this symptom"
            placeholderText="Enter name here..."
            style={[tw``, getCircular('Book')]}
          />
        )}
        {/* ICON (ONLY SHOW IF AN ID DOES NOT EXIST) */}
        {!symptom?.symptomId && (
          <InputFieldReadOnly
            headerText="Icon"
            borderAlways={true}
            value={'Change icon'}
            onFocus={() => {
              interactionEvent('Button', 'Pressed', {
                $screen_name: 'EditUserSymptom',
                value: 'Change total',
              });

              symptomNavigation.navigate('EditUserSymptomIcon', {
                symptom: symptom,
              });
            }}
            rightComponent={
              <PathizeIcon icon={getIcon(symptom.category as string)} />
            }
            style={[tw``, getCircular('Book')]}
          />
        )}
        {/* TEXT INPUT */}
        <InputField
          padding={true}
          inputBackgroundColor="bg-white"
          multiline={true}
          value={symptomNotes}
          onChangeText={setSymptomNotes}
          headerText="Notes on this symptom (optional)"
          placeholderText="Enter notes here..."
          style={[tw``, getCircular('Book')]}
        />
      </AppBodyLayout>
    </>
  );
};

export default EditUserSymptom;
