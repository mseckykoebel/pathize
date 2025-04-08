import React, {useEffect, useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import {trigger} from 'react-native-haptic-feedback';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {usePostHog} from 'posthog-react-native';
import tw from 'twrnc';

import {useAnalytics, useHandleLoadingError} from '../../hooks';
import {CheckInNavigatorParamList} from './CheckInsNavigator';
import {ProfileScreenParamList} from '../profile/ProfileScreenNavigator';
import {
  ChevronDown,
  Header1,
  Loading,
  PressableCard,
  PrimaryButton,
  Subheader,
} from '@pathize/mobile-ui';
import {UserSymptom} from '@pathize/db';
import {getCircular} from '../../utils';
import {useSymptomsContext, useOverlayContext} from '../../contexts';
import {getSortedItems} from '../../lib';
import {UserTrackerList} from '../../features/records';
import {AppBodyLayout, FadeInView} from '../../components/layouts';
import {PickerOverlaySheet, SheetNavbar} from '../../components/sheets';
import {DropdownItem} from '../../components/elements';

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

type Props = StackScreenProps<CheckInNavigatorParamList, 'NewCheckInSymptoms'>;

const NewCheckInSymptoms: React.FC<Props> = ({route}) => {
  const {checkIn} = route.params;
  const posthog = usePostHog();
  const {interactionEvent} = useAnalytics();
  const {
    userSymptoms,
    getUserSymptoms,
    getUserSymptomsLoading,
    getUserSymptomsError,
  } = useSymptomsContext();
  const {pickerVisible, setPickerSource, pickerSource, setPickerVisible} =
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
      StackNavigationProp<CheckInNavigatorParamList, 'NewCheckInSymptoms'>
    >();

  // handle initial setting of the filter
  useEffect(() => {
    const getSavedSymptomsFilter = async () => {
      if (selectedDropdownItem) {
        await AsyncStorage.setItem(
          'userSymptomsSortOrderId',
          JSON.stringify(selectedDropdownItem),
        );
        return;
      }

      const savedDropdownItem = await AsyncStorage.getItem(
        'userSymptomsSortOrderId',
      );

      if (!savedDropdownItem || savedDropdownItem === 'null') {
        setSelectedDropdownItem(dropdownItems[0]);
      } else {
        setSelectedDropdownItem(JSON.parse(savedDropdownItem));
      }
    };

    getSavedSymptomsFilter();
  }, [selectedDropdownItem]);

  useEffect(() => {
    getUserSymptoms();
  }, [getUserSymptoms]);

  const sortedUserSymptoms =
    userSymptoms && getSortedItems(userSymptoms, selectedDropdownItem);
  useHandleLoadingError(getUserSymptomsError, getUserSymptomsLoading, () => {});

  return (
    <>
      <SheetNavbar
        onClose={() => profileNavigation.navigate('UserCheckIns')}
        posthog={posthog}
        screenName="NewCheckInSymptoms"
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
                $screen_name: 'Name',
                value: 'Continue',
              });

              checkInNavigation.navigate('NewCheckInConfirm', {
                checkIn: {
                  ...checkIn,
                  symptoms: [],
                },
              });
            }}
            text="Skip"
            loading={false} // TODO: create check in loading
            textStyle={[tw``, getCircular('Bold')]}
          />
        }>
        {/* HEADER */}
        <View style={tw`flex flex-row justify-between items-center`}>
          {/* HEADER (MODIFIED) */}
          <Header1
            text="Select one or more symptoms to track"
            style={[
              tw`text-slate-900 text-2xl font-bold  ${
                sortedUserSymptoms ? 'w-65' : 'w-full'
              }`,
              getCircular('Bold'),
            ]}
          />
          {selectedDropdownItem && sortedUserSymptoms ? (
            <TouchableOpacity
              style={tw`flex-row justify-center items-center`}
              onPress={() => {
                trigger('impactLight');
                setPickerSource('newCheckInSymptoms');
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
        {/* SUBHEADER */}
        <Subheader
          padding={true}
          text="Press and hold to select more than one quickly."
          style={[tw``, getCircular('Book')]}
        />
        {/* EMPTY SPACE */}
        {!sortedUserSymptoms ? (
          <View style={tw`flex justify-center rounded-md mb-5 mt-4`}>
            <View style={tw`w-80 m-auto`}>
              <Text style={tw`text-center text-neutral-500 text-sm`}>
                You haven't added any symptoms to track yet! Symptoms can be
                managed in the "Symptoms" section of Pathize.
              </Text>
            </View>
          </View>
        ) : null}
        {/* SYMPTOMS ARE PRESENT */}
        {sortedUserSymptoms && sortedUserSymptoms.length > 0 ? (
          <FadeInView duration={200}>
            <View style={tw`my-3`}>
              <UserTrackerList
                screenName="NewCheckInSymptoms"
                items={sortedUserSymptoms as UserSymptom[]}
                createNavigator={checkInNavigation}
                multiSelectIsEnabled={multiSelectIsEnabled}
                multiSelectButtonText="Continue"
                isCheckIn={true}
                additionalNavigationParams={checkIn}
                padding={false}
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
                $screen_name: 'NewCheckInSymptoms',
                value: 'Add a new symptom',
              });

              setMultiSelectIsEnabled(false);
              profileNavigation.navigate('UserSymptoms');
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
        {/* PICKER OVERLAY */}
        {pickerVisible && pickerSource === 'newCheckInSymptoms' && (
          <PickerOverlaySheet
            items={dropdownItems}
            selectedItem={selectedDropdownItem}
            setSelectedItem={setSelectedDropdownItem}
            labelKey="name"
            portalHost="newCheckInSymptoms"
          />
        )}
        {/* LOADING */}
        <Loading loading={getUserSymptomsLoading} />
      </AppBodyLayout>
    </>
  );
};

export default NewCheckInSymptoms;
