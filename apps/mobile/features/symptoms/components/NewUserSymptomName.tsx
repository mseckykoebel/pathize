import React, {useState} from 'react';
import {View} from 'react-native';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import {usePostHog} from 'posthog-react-native';
import tw from 'twrnc';

import {SymptomNavigatorParamList} from '../../../screens/symptoms/SymptomNavigator';
import {ProfileScreenParamList} from '../../../screens/profile/ProfileScreenNavigator';
import {AppBodyLayout} from '../../../components/layouts';
import {SheetNavbar} from '../../../components/sheets';
import {getCircular} from '../../../utils';
import {Header1, InputField, PrimaryButton} from '@pathize/mobile-ui';
import {useAnalytics} from '../../../hooks';

type Props = StackScreenProps<SymptomNavigatorParamList, 'NewUserSymptomName'>;

const NewUserSymptomName: React.FC<Props> = ({route}) => {
  const [symptomName, setSymptomName] = useState('');
  const {symptom} = route.params;
  const profileNavigation =
    useNavigation<
      StackNavigationProp<ProfileScreenParamList, 'UserSymptoms'>
    >();
  const symptomNavigation =
    useNavigation<
      StackNavigationProp<SymptomNavigatorParamList, 'NewUserSymptomName'>
    >();
  const {interactionEvent} = useAnalytics();
  const posthog = usePostHog();

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
        avoidKeyboard={true}
        paddingSides={true}
        navigator={symptomNavigation}
        swipeToDismiss={true}
        route="UserSymptoms"
        backgroundColor="bg-white">
        {/* HEADER */}
        <Header1
          text="Next, give this symptom a name you'll recognize"
          style={[tw`text-slate-900 text-2xl font-bold `, getCircular('Bold')]}
        />
        <InputField
          padding={true}
          headerText="Symptom name"
          inputBackgroundColor="bg-white"
          value={symptomName}
          onChangeText={setSymptomName}
          placeholderText="Symptom name"
          onFocus={() => {
            interactionEvent('Input', 'Focused', {
              $screen_name: 'NewUserSymptomName',
              value: symptomName,
            });
          }}
          style={[tw``, getCircular('Book')]}
        />
        <View style={tw`flex-1 justify-end`}>
          <PrimaryButton
            padding={false}
            width="half"
            rounded="small"
            onPress={() => {
              interactionEvent('Button', 'Pressed', {
                $screen_name: 'NewUserSymptomName',
                value: 'Continue',
              });

              symptomNavigation.navigate('NewUserSymptomConfirm', {
                symptom: {
                  ...symptom,
                  name: symptomName,
                },
              });
            }}
            text="Continue"
            disabled={symptomName.length === 0 ? true : false}
            textStyle={[tw``, getCircular('Bold')]}
          />
        </View>
      </AppBodyLayout>
    </>
  );
};

export default NewUserSymptomName;
