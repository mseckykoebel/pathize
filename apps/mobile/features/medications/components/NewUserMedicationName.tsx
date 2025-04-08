import React, {useState} from 'react';
import {View} from 'react-native';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import {usePostHog} from 'posthog-react-native';
import tw from 'twrnc';

import {AppBodyLayout} from '../../../components/layouts';
import {getCircular} from '../../../utils';
import {SheetNavbar} from '../../../components/sheets';
import {ProfileScreenParamList} from '../../../screens/profile/ProfileScreenNavigator';
import {Header1, InputField, PrimaryButton} from '@pathize/mobile-ui';
import {MedicationNavigatorParamList} from '../../../screens/medications/MedicationsNavigator';
import {useAnalytics} from '../../../hooks';

type Props = StackScreenProps<
  MedicationNavigatorParamList,
  'NewUserMedicationName'
>;

const NewUserMedicationName: React.FC<Props> = () => {
  const [medicationName, setMedicationName] = useState('');
  const profileNavigation =
    useNavigation<
      StackNavigationProp<ProfileScreenParamList, 'UserMedications'>
    >();
  const medicationNavigation =
    useNavigation<
      StackNavigationProp<MedicationNavigatorParamList, 'NewUserMedicationName'>
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
        {/* HEADER */}
        <Header1
          text="Give this medication or supplement a name you'll recognize"
          style={[tw`text-slate-900 text-2xl font-bold `, getCircular('Bold')]}
        />
        <InputField
          padding={true}
          headerText="Name"
          inputBackgroundColor="bg-white"
          value={medicationName}
          onChangeText={setMedicationName}
          placeholderText="Name"
          onFocus={() => {
            interactionEvent('Input', 'Focused', {
              $screen_name: 'Name',
              value: medicationName,
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
                $screen_name: 'Name',
                value: medicationName,
              });

              medicationNavigation.navigate('NewUserMedicationType', {
                medication: {
                  medicationName: medicationName,
                },
              });
            }}
            text="Continue"
            disabled={medicationName.length === 0 ? true : false}
            textStyle={[tw``, getCircular('Bold')]}
          />
        </View>
      </AppBodyLayout>
    </>
  );
};

export default NewUserMedicationName;
