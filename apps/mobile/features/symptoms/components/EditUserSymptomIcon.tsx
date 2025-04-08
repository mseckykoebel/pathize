import React, {useCallback, useEffect, useState} from 'react';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import {usePostHog} from 'posthog-react-native';
import tw from 'twrnc';

import {SymptomCategory} from '@pathize/db';
import {SymptomNavigatorParamList} from '../../../screens/symptoms/SymptomNavigator';
import {ProfileScreenParamList} from '../../../screens/profile/ProfileScreenNavigator';
import {getCircular, getIcon} from '../../../utils';
import {AppBodyLayout} from '../../../components/layouts';
import {SheetNavbar} from '../../../components/sheets';
import {Header1, SquareButtonGroup, Subheader} from '@pathize/mobile-ui';
import {useAnalytics} from '../../../hooks';

const iconNames: SymptomCategory[] = [
  'Sleep',
  'Respiratory',
  'Physical',
  'Pain',
  'Orthostatic',
  'Neurological',
  'Immune',
  'Gastrointestinal',
  'Endocrine',
];

type Props = StackScreenProps<SymptomNavigatorParamList, 'EditUserSymptomIcon'>;

const EditUserSymptomIcon: React.FC<Props> = ({route}) => {
  const {symptom: userSymptom} = route.params;
  const profileNavigation =
    useNavigation<
      StackNavigationProp<ProfileScreenParamList, 'UserSymptoms'>
    >();
  const symptomNavigation =
    useNavigation<
      StackNavigationProp<SymptomNavigatorParamList, 'NewUserSymptomSearch'>
    >();
  const {interactionEvent} = useAnalytics();
  const posthog = usePostHog();

  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const iconExtractor = useCallback((item: string) => getIcon(item), []);

  useEffect(() => {
    if (selectedItem) {
      interactionEvent('Icon', 'Selected', {
        $screen_name: 'UserSymptoms',
        value: selectedItem,
      });

      symptomNavigation.navigate('EditUserSymptom', {
        symptom: {
          ...userSymptom,
          category: selectedItem,
        },
      });
    }
  }, [selectedItem, symptomNavigation, userSymptom, interactionEvent]);

  return (
    <>
      <SheetNavbar
        onClose={() => profileNavigation.navigate('UserSymptoms')}
        posthog={posthog}
        screenName="UserSymptoms"
        navigation={symptomNavigation}
      />
      <AppBodyLayout
        scrollable={true}
        avoidKeyboard={false}
        dismissKeyboardOnTouch={true}
        swipeToDismiss={true}
        padding={false}
        paddingSides={true}
        navigator={symptomNavigation}
        route="UserSymptoms"
        backgroundColor="bg-white">
        {/* HEADER */}
        <Header1
          text="Select this new symptom's icon"
          style={[tw`text-slate-900 text-2xl font-bold `, getCircular('Bold')]}
        />
        {/* SUBHEADER */}
        <Subheader
          text="An icon also corresponds to the symptom's category."
          style={[tw``, getCircular('Book')]}
        />
        {/* BUTTON INPUT GROUP AREA */}
        <SquareButtonGroup
          iconNames={iconNames}
          iconExtractor={iconExtractor}
          setSelectedItem={setSelectedItem}
          iconSize={40}
          iconBackgroundColor="bg-white"
        />
      </AppBodyLayout>
    </>
  );
};

export default EditUserSymptomIcon;
