import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {trigger} from 'react-native-haptic-feedback';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {usePostHog} from 'posthog-react-native';
import tw from 'twrnc';

import {AppBodyLayout, FadeInView} from '../../../components/layouts';
import {HomeStackScreenParamList} from '../../../CoreNav';
import {getCircular} from '../../../utils';
import {DropdownItem} from '../../../components/elements';
import {PickerOverlaySheet, SheetNavbar} from '../../../components/sheets';
import {MedicationNavigatorParamList} from '../../../screens/medications/MedicationsNavigator';
import {getSortedItems} from '../../../lib';
import {useMedicationsContext, useOverlayContext} from '../../../contexts';
import {useAnalytics, useHandleLoadingError} from '../../../hooks';
import {
  ChevronDown,
  Divider,
  Header1,
  Loading,
  PressableCard,
} from '@pathize/mobile-ui';
import {UserTrackerList} from '../../records';
import {UserMedication} from '@pathize/db';

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

type Props = StackScreenProps<
  MedicationNavigatorParamList,
  'AddNewMedicationRecord'
>;

const AddNewMedicationRecord: React.FC<Props> = () => {
  const {
    userMedications,
    getUserMedications,
    userMedicationsLoading,
    userMedicationsError,
  } = useMedicationsContext();
  const {pickerVisible, setPickerSource, pickerSource, setPickerVisible} =
    useOverlayContext();

  const [selectedDropdownItem, setSelectedDropdownItem] =
    useState<DropdownItem | null>(null);
  const medicationNavigation =
    useNavigation<
      StackNavigationProp<
        MedicationNavigatorParamList,
        'AddNewMedicationRecord'
      >
    >();
  const homeNavigation =
    useNavigation<
      StackNavigationProp<HomeStackScreenParamList, 'Medications'>
    >();
  const {interactionEvent} = useAnalytics();
  const posthog = usePostHog();

  const [multiSelectIsEnabled, setMultiSelectIsEnabled] = useState(true); // force disables the pop-up if we navigate away

  // handle initial setting of the filter
  useEffect(() => {
    const getSavedActivitiesFilter = async () => {
      if (selectedDropdownItem) {
        await AsyncStorage.setItem(
          'userMedicationSortOrderId',
          JSON.stringify(selectedDropdownItem),
        );
        return;
      }

      const savedDropdownItem = await AsyncStorage.getItem(
        'userMedicationSortOrderId',
      );

      if (!savedDropdownItem || savedDropdownItem === 'null') {
        setSelectedDropdownItem(dropdownItems[0]);
      } else {
        setSelectedDropdownItem(JSON.parse(savedDropdownItem));
      }
    };

    getSavedActivitiesFilter();
  }, [selectedDropdownItem]);

  useEffect(() => {
    getUserMedications();
  }, [getUserMedications]);

  const sortedUserMedications =
    userMedications && getSortedItems(userMedications, selectedDropdownItem);
  useHandleLoadingError(userMedicationsError, userMedicationsLoading, () => {});

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
            text="Select one or more medications+"
            style={[
              tw`text-slate-900 text-2xl font-bold  ${
                sortedUserMedications ? 'w-65' : 'w-full'
              }`,
              getCircular('Bold'),
            ]}
          />
          {selectedDropdownItem && sortedUserMedications ? (
            <TouchableOpacity
              style={tw`flex-row justify-center items-center`}
              onPress={() => {
                trigger('impactLight');
                setPickerSource('addNewMedicationRecord');
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
        {!sortedUserMedications ? (
          <View style={tw`flex justify-center rounded-md mb-5 mt-4`}>
            <View style={tw`w-80 m-auto`}>
              <Text style={tw`text-center text-neutral-500 text-sm`}>
                You haven't added any medications or supplements to track yet!
                Medications and supplements can be managed in the "Medications+"
                section of Pathize.
              </Text>
            </View>
          </View>
        ) : null}
        {/* MEDICATIONS ARE PRESENT */}
        {sortedUserMedications && sortedUserMedications.length > 0 ? (
          <FadeInView duration={200}>
            <View style={tw`my-3`}>
              <UserTrackerList
                screenName="AddNewMedicationRecord"
                items={sortedUserMedications as UserMedication[]}
                createNavigator={medicationNavigation}
                multiSelectIsEnabled={multiSelectIsEnabled}
                multiSelectButtonText="Continue"
                padding={false}
                disableBadges={true}
              />
            </View>
          </FadeInView>
        ) : null}
        {/* IF NO MEDICATIONS, SHOW ADD BUTTON */}
        {sortedUserMedications && sortedUserMedications.length === 0 && (
          <PressableCard
            onPress={() => {
              interactionEvent('Button', 'Pressed', {
                $screen_name: 'AddNewMedicationRecord',
                value: 'Add a new medication',
              });

              setMultiSelectIsEnabled(false);
              medicationNavigation.navigate('NewUserMedicationSearch');
            }}
            headerText="Add a new medication"
            textChild="You haven't added any medications or supplements to track yet! Medications and supplements can be
            managed from the 'Medications+' section of Pathize."
            alertChild={'+'}
            padding={true}
            headerTextStyle={[tw``, getCircular('Bold')]}
            bodyTextStyle={[tw``, getCircular('Book')]}
          />
        )}
        {/* DIVIDER */}
        <Divider padding={true} />
        {/* ADD NEW BUTTON */}
        <PressableCard
          onPress={() => {
            interactionEvent('Button', 'Pressed', {
              $screen_name: 'Home',
              value: 'Add a custom medication+',
            });

            setMultiSelectIsEnabled(false);
            medicationNavigation.navigate('NewUserMedicationSearch');
          }}
          headerText="Add a new medication+"
          alertChild={'+'}
          padding={true}
          headerTextStyle={[tw``, getCircular('Bold')]}
          bodyTextStyle={[tw``, getCircular('Book')]}
        />
        {/* PICKER OVERLAY */}
        {pickerVisible && pickerSource === 'addNewMedicationRecord' && (
          <PickerOverlaySheet
            items={dropdownItems}
            selectedItem={selectedDropdownItem}
            setSelectedItem={setSelectedDropdownItem}
            labelKey="name"
            portalHost="addNewMedicationRecord"
          />
        )}
        {/* LOADING */}
        <Loading loading={userMedicationsLoading} />
      </AppBodyLayout>
    </>
  );
};

export default AddNewMedicationRecord;
