import React, {useState} from 'react';
import {View} from 'react-native';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import {usePostHog} from 'posthog-react-native';
import tw from 'twrnc';

import {UserSymptom} from '@pathize/db';
import {SymptomNavigatorParamList} from '../../../screens/symptoms/SymptomNavigator';
import {ProfileScreenParamList} from '../../../screens/profile/ProfileScreenNavigator';
import {AppBodyLayout} from '../../../components/layouts';
import {SheetNavbar} from '../../../components/sheets';
import {getCircular} from '../../../utils';
import {useAnalytics, useHandleLoadingError} from '../../../hooks';
import {useSymptomsContext} from '../../../contexts';
import {Header1, InputField, PrimaryButton} from '@pathize/mobile-ui';

type Props = StackScreenProps<
  SymptomNavigatorParamList,
  'NewUserSymptomConfirm'
>;

const NewUserSymptomConfirm: React.FC<Props> = ({route}) => {
  const {symptom} = route.params;
  const [symptomNotes, setSymptomNotes] = useState('');
  const {
    createUserSymptom,
    createUserSymptomLoading: loading,
    createUserSymptomError: error,
  } = useSymptomsContext();
  const profileNavigation =
    useNavigation<
      StackNavigationProp<ProfileScreenParamList, 'UserSymptoms'>
    >();
  const symptomNavigation =
    useNavigation<
      StackNavigationProp<SymptomNavigatorParamList, 'NewUserSymptomConfirm'>
    >();
  const {interactionEvent} = useAnalytics();
  const posthog = usePostHog();

  const handleClosePress = () => profileNavigation.navigate('UserSymptoms');
  useHandleLoadingError(error, loading, handleClosePress);

  return (
    <>
      <SheetNavbar
        onClose={() => profileNavigation.navigate('UserSymptoms')}
        posthog={posthog}
        screenName="UserSymptoms"
        navigation={symptomNavigation}
      />
      <AppBodyLayout
        dismissKeyboardOnTouch={true}
        scrollable={false}
        avoidKeyboard={false}
        padding={false}
        paddingSides={true}
        navigator={symptomNavigation}
        swipeToDismiss={true}
        route="UserSymptoms"
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
            value={symptomNotes}
            onChangeText={setSymptomNotes}
            headerText="Notes on this symptom (optional)"
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
                $screen_name: 'UserSymptoms',
                value: 'Save',
              });

              return createUserSymptom({
                ...(symptom as UserSymptom),
                notes: symptomNotes,
              });
            }}
            textStyle={[getCircular('Bold'), tw``]}
          />
        </View>
      </AppBodyLayout>
    </>
  );
};

export default NewUserSymptomConfirm;
