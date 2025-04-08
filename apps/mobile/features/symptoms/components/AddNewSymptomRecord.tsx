import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {trigger} from 'react-native-haptic-feedback';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {usePostHog} from 'posthog-react-native';
import tw from 'twrnc';

import {
  ChevronDown,
  Divider,
  Header1,
  Loading,
  PressableCard,
} from '@pathize/mobile-ui';
import {UserSymptom} from '@pathize/db';
import {AppBodyLayout, FadeInView} from '../../../components/layouts';
import {SymptomNavigatorParamList} from '../../../screens/symptoms/SymptomNavigator';
import {HomeStackScreenParamList} from '../../../CoreNav';
import {DropdownItem} from '../../../components/elements';
import {PickerOverlaySheet, SheetNavbar} from '../../../components/sheets';
import {useOverlayContext, useSymptomsContext} from '../../../contexts';
import {getSortedItems} from '../../../lib';
import {getCircular} from '../../../utils';
import {useAnalytics, useHandleLoadingError} from '../../../hooks';
import {UserTrackerList} from '../../records';

const dropdownItems: DropdownItem[] = [
  {
    id: '1',
    name: 'Date created (newest to oldest)',
  },
  {
    id: '2',
    name: 'Date created (oldest to newest)',
  },
  {id: '3', name: 'Date modified'},
  {id: '4', name: 'Name (A-Z)'},
];

type Props = StackScreenProps<SymptomNavigatorParamList, 'AddNewSymptomRecord'>;

const AddNewSymptomRecord: React.FC<Props> = () => {
  const {
    userSymptoms,
    getUserSymptoms,
    getUserSymptomsError,
    getUserSymptomsLoading,
  } = useSymptomsContext();
  const {pickerVisible, pickerSource, setPickerSource, setPickerVisible} =
    useOverlayContext();
  const homeNavigation =
    useNavigation<StackNavigationProp<HomeStackScreenParamList, 'Symptoms'>>();
  const symptomNavigation =
    useNavigation<
      StackNavigationProp<SymptomNavigatorParamList, 'AddNewSymptomRecord'>
    >();
  const {interactionEvent} = useAnalytics();
  const posthog = usePostHog();

  const [selectedDropdownItem, setSelectedDropdownItem] =
    useState<DropdownItem | null>(null);
  const [multiSelectIsEnabled, setMultiSelectIsEnabled] = useState(true); // force disables the pop-up if we navigate away

  useEffect(() => {
    getUserSymptoms();
  }, [getUserSymptoms]);

  // handle initial setting of the filter
  useEffect(() => {
    const getSavedActivitiesFilter = async () => {
      if (selectedDropdownItem) {
        await AsyncStorage.setItem(
          'userSymptomSortOrderId',
          JSON.stringify(selectedDropdownItem),
        );
        return;
      }

      const savedDropdownItem = await AsyncStorage.getItem(
        'userSymptomSortOrderId',
      );

      if (!savedDropdownItem || savedDropdownItem === 'null') {
        setSelectedDropdownItem(dropdownItems[0]);
      } else {
        setSelectedDropdownItem(JSON.parse(savedDropdownItem));
      }
    };

    getSavedActivitiesFilter();
  }, [selectedDropdownItem]);

  const sortedUserSymptoms =
    userSymptoms && getSortedItems(userSymptoms, selectedDropdownItem);
  useHandleLoadingError(getUserSymptomsError, getUserSymptomsLoading, () => {});

  return (
    <>
      <SheetNavbar
        onClose={() => homeNavigation.navigate('Home')}
        posthog={posthog}
        screenName="Home"
      />
      <AppBodyLayout
        scrollable={true}
        avoidKeyboard={true}
        padding={false}
        paddingSides={true}
        navigator={homeNavigation}
        swipeToDismiss={true}
        dismissKeyboardOnTouch={true}
        route="Home"
        backgroundColor="bg-white">
        <View style={tw`flex flex-row justify-between items-center`}>
          {/* HEADER (MODIFIED) */}
          <Header1
            text="Select one or more symptoms"
            style={[
              tw`text-slate-900 text-2xl font-bold  w-65`,
              getCircular('Bold'),
            ]}
          />
          {selectedDropdownItem && sortedUserSymptoms ? (
            <TouchableOpacity
              style={tw`flex-row justify-center items-center`}
              onPress={() => {
                trigger('impactLight');
                setPickerSource('addNewSymptomRecord');
                setPickerVisible(!pickerVisible);
              }}>
              <Text
                style={[
                  tw` text-neutral-500 text-base font-medium mr-2`,
                  getCircular('Book'),
                ]}>
                Sort
              </Text>
              <ChevronDown size={16} color="#7A7A7A" />
            </TouchableOpacity>
          ) : null}
        </View>
        {/* EMPTY SPACE */}
        {!sortedUserSymptoms ? (
          <View style={tw`flex justify-center rounded-md mb-5 mt-4`}>
            <View style={tw`w-80 m-auto`}>
              <Text style={tw`text-center text-neutral-500 text-sm`}>
                You haven't added any symptoms to track yet! Symptoms can be
                managed from the "Symptoms" section of Pathize.
              </Text>
            </View>
          </View>
        ) : null}
        {/* SYMPTOMS ARE PRESENT */}
        {sortedUserSymptoms && sortedUserSymptoms.length > 0 ? (
          <FadeInView duration={200}>
            <View style={tw`my-3`}>
              <UserTrackerList
                screenName="AddNewSymptomRecord"
                items={sortedUserSymptoms as UserSymptom[]}
                createNavigator={symptomNavigation}
                multiSelectIsEnabled={multiSelectIsEnabled}
                multiSelectButtonText="Continue"
                padding={false}
                isCheckIn={false}
                disableBadges={true}
              />
            </View>
          </FadeInView>
        ) : null}
        {/* IF NO SYMPTOMS, SHOW ADD BUTTON */}
        {sortedUserSymptoms && sortedUserSymptoms.length === 0 && (
          <PressableCard
            onPress={() => {
              interactionEvent('Button', 'Pressed', {
                $screen_name: 'Home',
                value: 'Add a custom symptom',
              });

              setMultiSelectIsEnabled(false);
              symptomNavigation.navigate('NewUserSymptomSearch');
            }}
            headerText="Add a new symptom"
            textChild="You haven't added any symptoms to track yet! Symptoms can be
            managed from the 'Symptoms' section of Pathize."
            alertChild={'+'}
            padding={true}
            headerTextStyle={[tw``, getCircular('Bold')]}
            bodyTextStyle={[tw``, getCircular('Book')]}
          />
        )}
        {/* SHOW ADD NEW ALWAYS */}
        {/* DIVIDER */}
        <Divider padding={true} />
        {/* ADD NEW BUTTON */}
        <PressableCard
          onPress={() => {
            interactionEvent('Button', 'Pressed', {
              $screen_name: 'Home',
              value: 'Add a custom symptom',
            });

            setMultiSelectIsEnabled(false);
            symptomNavigation.navigate('NewUserSymptomSearch');
          }}
          headerText="Add a new symptom"
          alertChild={'+'}
          padding={true}
          headerTextStyle={[tw``, getCircular('Bold')]}
          bodyTextStyle={[tw``, getCircular('Book')]}
        />

        {/* PICKER OVERLAY */}
        {pickerVisible && pickerSource === 'addNewSymptomRecord' && (
          <PickerOverlaySheet
            items={dropdownItems}
            selectedItem={selectedDropdownItem}
            setSelectedItem={setSelectedDropdownItem}
            labelKey="name"
            portalHost="addNewSymptomRecord"
          />
        )}
        {/* LOADING */}
        <Loading loading={getUserSymptomsLoading} />
      </AppBodyLayout>
    </>
  );
};

export default AddNewSymptomRecord;
