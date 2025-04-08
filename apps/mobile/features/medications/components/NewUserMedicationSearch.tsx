import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {faSearch} from '@fortawesome/free-solid-svg-icons';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import {usePostHog} from 'posthog-react-native';
import {useNavigation} from '@react-navigation/native';
import tw from 'twrnc';

import {Medication} from '@pathize/api';
import {getCircular, getIcon} from '../../../utils';
import {AppBodyLayout} from '../../../components/layouts';
import {SheetNavbar} from '../../../components/sheets';
import {MedicationNavigatorParamList} from '../../../screens/medications/MedicationsNavigator';
import {ProfileScreenParamList} from '../../../screens/profile/ProfileScreenNavigator';
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
import {useMedicationsContext} from '../../../contexts';
import {useAnalytics, useHandleLoadingError} from '../../../hooks';

const SearchIcon = () => {
  return <PathizeIcon icon={faSearch} size={16} iconColor={'#a3a3a3'} />;
};

const transformMedicationsToCategoryList = (
  medications: Medication[],
): {sectionTitle: string; data: string[]}[] => {
  const medicationNames: string[] = [];

  medications.forEach(medication => {
    medicationNames.push(medication.medicationName);
  });

  return [
    {
      sectionTitle: 'Medications+',
      data: medicationNames,
    },
  ];
};

type Props = StackScreenProps<
  MedicationNavigatorParamList,
  'NewUserMedicationSearch'
>;

const NewUserMedicationSearch: React.FC<Props> = () => {
  const {
    searchAllMedications,
    medicationsFromSearch,
    medicationSearchLoading: loading,
    medicationSearchError: error,
  } = useMedicationsContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedication, setSelectedMedication] = useState<string>('');

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

  const transformedData = useMemo(() => {
    return transformMedicationsToCategoryList(medicationsFromSearch ?? []);
  }, [medicationsFromSearch]);

  const iconExtractor = useCallback(() => {
    return getIcon('Medication');
  }, []);

  useEffect(() => {
    setSelectedMedication('');
    if (searchQuery.length < 3) return;
    searchAllMedications(searchQuery);
  }, [searchAllMedications, searchQuery]);

  useEffect(() => {
    if (selectedMedication === '') return;
    const medication = medicationsFromSearch?.find(
      m => m.medicationName === selectedMedication,
    );

    if (!medication) return;

    medicationNavigation.navigate('NewUserMedicationType', {
      medication: medication,
    });
  }, [medicationNavigation, medicationsFromSearch, selectedMedication]);

  useHandleLoadingError(error, loading, () => {});

  return (
    <>
      <SheetNavbar
        onClose={() => profileNavigation.navigate('UserMedications')}
        posthog={posthog}
        screenName="UserMedications"
        navigation={medicationNavigation}
      />
      <AppBodyLayout
        scrollable={true}
        avoidKeyboard={false}
        dismissKeyboardOnTouch={true}
        swipeToDismiss={true}
        padding={false}
        paddingSides={true}
        navigator={medicationNavigation}
        route="UserMedications"
        backgroundColor="bg-white">
        <View>
          {/* HEADER (MODIFIED) */}
          <Header1
            text="Search for a medication or supplement"
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
            placeholderText="Type to filter..."
            style={[tw``, getCircular('Book')]}
          />
          {/* ADD NEW BUTTON */}
          <PressableCard
            onPress={() => {
              interactionEvent('Button', 'Pressed', {
                $screen_name: 'NewUserMedicationSearch',
                value: 'Add a custom medication or supplement',
              });

              medicationNavigation.navigate('NewUserMedicationName');
            }}
            headerText="Add a custom medication or supplement"
            alertChild={'+'}
            padding={true}
            headerTextStyle={[tw``, getCircular('Bold')]}
            bodyTextStyle={[tw``, getCircular('Book')]}
          />
          {/* LENGTH IS ZERO */}
          {!loading &&
            medicationsFromSearch?.length === 0 &&
            searchQuery.length > 0 && (
              <FadeInFadeOut
                watchValue={
                  !loading &&
                  medicationsFromSearch?.length === 0 &&
                  searchQuery.length > 0
                }>
                <View style={tw`flex-1 justify-center items-center mt-3`}>
                  <Subheader
                    text="No items found! If you'd like to track something else, you can add a custom medication or supplement above."
                    style={[tw`text-center w-70`, getCircular('Book')]}
                  />
                </View>
              </FadeInFadeOut>
            )}
          {/* LENGTH IS LESS THAN THREE */}
          {searchQuery.length < 3 && (
            <FadeInFadeOut watchValue={searchQuery.length < 3}>
              <View style={tw`flex-1 justify-center items-center mt-3`}>
                <Subheader
                  text="Enter at least three characters to see results"
                  style={[tw`text-center w-70`, getCircular('Book')]}
                />
              </View>
            </FadeInFadeOut>
          )}
        </View>
        {/* IF SEARCH QUERY IS PRESENT AND THERE ARE MEDICATIONS */}
        {searchQuery.length > 2 && (
          <FadeInFadeOut
            style={tw`flex-1`}
            watchValue={medicationsFromSearch?.length !== 0}>
            <CategoryList
              scrollEnabled={false}
              sectionsData={transformedData}
              setSelectedItem={setSelectedMedication}
              iconExtractor={iconExtractor}
              titleStyle={[tw``, getCircular('Bold')]}
            />
          </FadeInFadeOut>
        )}
        <Loading loading={loading} />
      </AppBodyLayout>
    </>
  );
};

export default NewUserMedicationSearch;
