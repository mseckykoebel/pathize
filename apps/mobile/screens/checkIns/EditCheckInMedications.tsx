import React, {useEffect, useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import {trigger} from 'react-native-haptic-feedback';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {usePostHog} from 'posthog-react-native';
import tw from 'twrnc';

import {
  ChevronDown,
  Header1,
  Loading,
  PressableCard,
  PrimaryButton,
} from '@pathize/mobile-ui';
import {UserMedication} from '@pathize/db';
import {useAnalytics, useHandleLoadingError} from '../../hooks';
import {CheckInNavigatorParamList} from './CheckInsNavigator';
import {ProfileScreenParamList} from '../profile/ProfileScreenNavigator';
import {getCircular} from '../../utils';
import {useMedicationsContext, useOverlayContext} from '../../contexts';
import {getSortedItems} from '../../lib';
import {UserTrackerList} from '../../features/records';
import {PickerOverlaySheet, SheetNavbar} from '../../components/sheets';
import {AppBodyLayout, FadeInView} from '../../components/layouts';
import {DropdownItem} from '../../components';

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
  CheckInNavigatorParamList,
  'EditCheckInMedications'
>;

const EditCheckInMedications: React.FC<Props> = ({route}) => {
  const {checkIn, medications} = route.params;
  const posthog = usePostHog();
  const {interactionEvent} = useAnalytics();
  const {
    userMedications,
    getUserMedications,
    userMedicationsLoading,
    userMedicationsError,
  } = useMedicationsContext();
  const {pickerVisible, pickerSource, setPickerSource, setPickerVisible} =
    useOverlayContext();

  const [selectedDropdownItem, setSelectedDropdownItem] =
    useState<DropdownItem | null>(null);
  const [multiSelectIsEnabled, setMultiSelectIsEnabled] = useState(true);

  const profileNavigation =
    useNavigation<
      StackNavigationProp<ProfileScreenParamList, 'UserCheckIns'>
    >();
  const checkInNavigation =
    useNavigation<
      StackNavigationProp<CheckInNavigatorParamList, 'NewCheckInMedications'>
    >();

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
        onClose={() => profileNavigation.navigate('UserCheckIns')}
        posthog={posthog}
        screenName="NewCheckInMedications"
        navigation={checkInNavigation}
      />
      <AppBodyLayout
        dismissKeyboardOnTouch={true}
        scrollable={true}
        avoidKeyboard={true}
        paddingSides={true}
        navigator={checkInNavigation}
        swipeToDismiss={true}
        route="UserCheckIns"
        backgroundColor="bg-white"
        absoluteBottomChild={
          <PrimaryButton
            padding={false}
            width="half"
            rounded="small"
            onPress={() => {
              interactionEvent('Button', 'Pressed', {
                $screen_name: 'EditCheckInMedications',
                value: 'Go back',
              });

              checkInNavigation.navigate('EditCheckIn', {
                checkIn,
                medications: [],
              });
            }}
            text="Go back"
            disabled={false}
            textStyle={[tw``, getCircular('Bold')]}
          />
        }>
        {/* HEADER */}
        <View style={tw`flex flex-row justify-between items-center`}>
          {/* HEADER (MODIFIED) */}
          <Header1
            text="Select medications+ to track for this check-in"
            style={[
              tw`text-slate-900 text-2xl font-bold ${
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
                setPickerSource('editCheckInMedications');
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
                screenName="EditCheckInMedications"
                items={sortedUserMedications as UserMedication[]}
                initialSelectedItems={
                  medications && medications.length > 0
                    ? medications
                    : undefined
                }
                editNavigator={checkInNavigation}
                multiSelectIsEnabled={multiSelectIsEnabled}
                multiSelectButtonText="Save"
                isCheckIn={true}
                additionalNavigationParams={checkIn}
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
                $screen_name: 'NewCheckInMedications',
                value: 'Add a new medication+',
              });

              setMultiSelectIsEnabled(false);
              profileNavigation.navigate('UserMedications');
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
        {/* PICKER OVERLAY */}
        {pickerVisible && pickerSource === 'editCheckInMedications' && (
          <PickerOverlaySheet
            items={dropdownItems}
            selectedItem={selectedDropdownItem}
            setSelectedItem={setSelectedDropdownItem}
            labelKey="name"
            portalHost="editCheckInMedications"
          />
        )}
        {/* LOADING */}
        <Loading loading={userMedicationsLoading} />
      </AppBodyLayout>
    </>
  );
};

export default EditCheckInMedications;
