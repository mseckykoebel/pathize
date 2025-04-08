import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import {faSearch} from '@fortawesome/free-solid-svg-icons';
import {useNavigation} from '@react-navigation/native';
import {usePostHog} from 'posthog-react-native';
import tw from 'twrnc';

import {Symptom} from '@pathize/api';
import {SymptomNavigatorParamList} from '../../../screens/symptoms/SymptomNavigator';
import {ProfileScreenParamList} from '../../../screens/profile/ProfileScreenNavigator';
import {AppBodyLayout} from '../../../components/layouts';
import {SheetNavbar} from '../../../components/sheets';
import {getCircular, getIcon} from '../../../utils';
import {
  CategoryList,
  FadeInFadeOut,
  Header1,
  InputField,
  Loading,
  PathizeIcon,
  PressableCard,
  Subheader,
} from '@pathize/mobile-ui';
import {useSymptomsContext} from '../../../contexts';
import {useAnalytics, useHandleLoadingError} from '../../../hooks';

const SearchIcon = () => {
  return <PathizeIcon icon={faSearch} size={16} iconColor={'#a3a3a3'} />;
};

const transformSymptomsToCategoryList = (
  symptoms: Symptom[],
): {sectionTitle: string; data: string[]}[] => {
  const symptomsByIcon: {[icon: string]: string[]} = {};

  symptoms.forEach(symptom => {
    if (symptomsByIcon[symptom.category]) {
      symptomsByIcon[symptom.category].push(symptom.name);
    } else {
      symptomsByIcon[symptom.category] = [symptom.name];
    }
  });

  return Object.entries(symptomsByIcon).map(([icon, names]) => ({
    sectionTitle: icon,
    data: names,
  }));
};

type Props = StackScreenProps<
  SymptomNavigatorParamList,
  'NewUserSymptomSearch'
>;

const NewUserSymptomSearch: React.FC<Props> = () => {
  const {
    searchAllSymptoms,
    symptomsFromSearch: symptoms,
    symptomSearchLoading: loading,
    symptomSearchError: error,
  } = useSymptomsContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSymptom, setSelectedSymptom] = useState<string>('');

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

  useHandleLoadingError(error, loading, () => {});

  const transformedData = useMemo(() => {
    return transformSymptomsToCategoryList(symptoms ?? []);
  }, [symptoms]);

  const getSymptomByName = useCallback(
    (name: string) => {
      return symptoms?.find(s => s.name === name);
    },
    [symptoms],
  );

  const iconExtractor = useCallback(
    (item: string) => {
      const symptom = symptoms?.find(s => s.name === item);
      if (!symptom) return faSearch;

      return getIcon(symptom.category);
    },
    [symptoms],
  );

  useEffect(() => {
    setSelectedSymptom('');
    searchAllSymptoms(searchQuery);
  }, [searchAllSymptoms, searchQuery]);

  useEffect(() => {
    if (selectedSymptom === '') return;
    // if a symptom is selected, and it matches getSymptomByName, navigate
    if (selectedSymptom) {
      const symptom = getSymptomByName(selectedSymptom);
      if (symptom) {
        symptomNavigation.navigate('NewUserSymptomConfirm', {
          symptom: {
            symptomId: symptom.id,
            name: symptom.name,
            category: symptom.category,
            description: symptom.description,
          },
        });
      }
    }
  }, [symptomNavigation, getSymptomByName, selectedSymptom]);

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
        <View>
          {/* HEADER (MODIFIED) */}
          <Header1
            text="Search for a symptom"
            style={[
              tw`text-slate-900 text-2xl font-bold `,
              getCircular('Bold'),
            ]}
          />
          {/* SEARCH INPUT */}
          <InputField
            inputBackgroundColor="bg-white"
            value={searchQuery}
            onChangeText={setSearchQuery}
            padding={true}
            rightComponent={<SearchIcon />}
            placeholderText="Filter symptoms..."
            style={[tw``, getCircular('Book')]}
          />
          {/* ADD NEW BUTTON */}
          <PressableCard
            onPress={() => {
              interactionEvent('Button', 'Pressed', {
                $screen_name: 'NewUserSymptomSearch',
                value: 'Add a custom symptom',
              });

              symptomNavigation.navigate('NewUserSymptomIcon');
            }}
            headerText="Add a custom symptom"
            alertChild={'+'}
            padding={true}
            headerTextStyle={[tw``, getCircular('Bold')]}
            bodyTextStyle={[tw``, getCircular('Book')]}
          />
          {/* LENGTH IS ZERO */}
          {transformedData.length === 0 && (
            <FadeInFadeOut watchValue={transformedData.length === 0}>
              <View style={tw`flex-1 justify-center items-center mt-3`}>
                <Subheader
                  text="No symptoms found! If you'd like to track something else, you can add a custom symptom above."
                  style={[tw`text-center w-70`, getCircular('Book')]}
                />
              </View>
            </FadeInFadeOut>
          )}
        </View>
        {/* IF SEARCH QUERY IS PRESENT AND THERE ARE ACTIVITIES */}
        <FadeInFadeOut
          style={tw`flex-1`}
          watchValue={transformedData.length !== 0}>
          <CategoryList
            scrollEnabled={false}
            sectionsData={transformedData}
            setSelectedItem={setSelectedSymptom}
            iconExtractor={iconExtractor}
            titleStyle={[tw``, getCircular('Bold')]}
          />
        </FadeInFadeOut>
        {/* LOADING */}
        <Loading loading={loading} />
      </AppBodyLayout>
    </>
  );
};

export default NewUserSymptomSearch;
