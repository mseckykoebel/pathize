import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {ActivityIndicator, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {trigger} from 'react-native-haptic-feedback';
import {faApple} from '@fortawesome/free-brands-svg-icons';
import {usePostHog} from 'posthog-react-native';
import tw from 'twrnc';

import {AppBodyLayout, FadeInView} from '../../components/layouts';
import {DropdownItem} from '../../components/elements';
import {HomeStackScreenParamList} from '../../CoreNav';
import {getSortedItems} from '../../lib';
import {PickerOverlaySheet, SheetNavbar} from '../../components/sheets';
import {ActivityNavigatorParamList} from './ActivityNavigator';
import {
  useActivitiesContext,
  useAppleWatchContext,
  useOverlayContext,
} from '../../contexts';
import {UserActivity} from '@pathize/db';
import {useAnalytics, useHandleLoadingError} from '../../hooks';
import {
  Body1,
  ChevronDown,
  Divider,
  Header1,
  ListBox,
  Loading,
  PathizeIcon,
  PressableCard,
  ToggleSwitch,
} from '@pathize/mobile-ui';
import {getCircular} from '../../utils';
import {UserTrackerList} from '../../features/records';

const AppleIconChild: React.FC = () => {
  return (
    <View style={tw`flex flex-row items-center`}>
      <PathizeIcon icon={faApple} size={20} />
      <Body1
        text="Track live with Apple Watch"
        textStyle={[tw`text-gray-700 ml-2 mt-0.6`, getCircular('Book')]}
      />
    </View>
  );
};

const RightChild: React.FC<{
  loading: boolean;
  isEnabled: boolean;
  setIsEnabled: Dispatch<SetStateAction<boolean>>;
}> = ({loading, isEnabled, setIsEnabled}) => {
  return (
    <View style={tw`flex flex-row items-center`}>
      {loading ? (
        <ActivityIndicator size={'small'} />
      ) : (
        <ToggleSwitch
          isEnabled={isEnabled}
          onValueChange={() => setIsEnabled(!isEnabled)}
        />
      )}
    </View>
  );
};

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

const AddNewActivityRecord = () => {
  const posthog = usePostHog();
  const {
    userActivitiesLoading: loading,
    userActivitiesError: error,
    userActivities,
    getUserActivities,
  } = useActivitiesContext();
  const {pickerVisible, pickerSource, setPickerSource, setPickerVisible} =
    useOverlayContext();
  const {interactionEvent} = useAnalytics();
  const {isAWFullyAvailable, sendMessage, isAWRunningActivity} =
    useAppleWatchContext();
  const [isEnabled, setIsEnabled] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);

  const [selectedDropdownItem, setSelectedDropdownItem] =
    useState<DropdownItem | null>(null);
  const homeNavigation =
    useNavigation<
      StackNavigationProp<HomeStackScreenParamList, 'Activities'>
    >();
  const activityNavigation =
    useNavigation<
      StackNavigationProp<ActivityNavigatorParamList, 'AddNewActivityRecord'>
    >();

  // handle initial setting of the filter
  useEffect(() => {
    const getSavedActivitiesFilter = async () => {
      if (selectedDropdownItem) {
        await AsyncStorage.setItem(
          'userActivitiesSortOrderId',
          JSON.stringify(selectedDropdownItem),
        );
        return;
      }

      const savedDropdownItem = await AsyncStorage.getItem(
        'userActivitiesSortOrderId',
      );

      if (!savedDropdownItem || savedDropdownItem === 'null') {
        setSelectedDropdownItem(dropdownItems[0]);
      } else {
        setSelectedDropdownItem(JSON.parse(savedDropdownItem));
      }
    };

    getSavedActivitiesFilter();
  }, [selectedDropdownItem]);

  const toggleRecordOnAppleWatch = useCallback(async () => {
    try {
      const fullyAvailable = await isAWFullyAvailable();
      if (!fullyAvailable) {
        setIsEnabled(false);
        return;
      }
      setIsAvailable(fullyAvailable);
      sendMessage({activities: 'Update list of activities'}); // if watch available, send activities message, which should make sure that watch is most up to date
    } catch (err) {
      console.log(err);
      setIsEnabled(false);
    }
  }, [isAWFullyAvailable, sendMessage]);

  useEffect(() => {
    toggleRecordOnAppleWatch();
    getUserActivities();
  }, [getUserActivities, toggleRecordOnAppleWatch]);

  const sortedUserActivities =
    userActivities && getSortedItems(userActivities, selectedDropdownItem);
  useHandleLoadingError(error, loading, () => {});

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
            text="First, select an activity"
            style={[
              tw`text-slate-900 text-2xl font-bold w-65`,
              getCircular('Bold'),
            ]}
          />

          {selectedDropdownItem && sortedUserActivities ? (
            <TouchableOpacity
              style={tw`flex-row justify-center items-center`}
              onPress={() => {
                trigger('impactLight');
                setPickerSource('addNewActivityRecord');
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
        {/* APPLE WATCH AREA */}
        {!isAWRunningActivity && isAvailable && sortedUserActivities && (
          <FadeInView duration={200}>
            <ListBox
              textChild={<AppleIconChild />}
              rightChild={
                <RightChild
                  loading={loading}
                  isEnabled={isEnabled}
                  setIsEnabled={setIsEnabled}
                />
              }
              padding={true}
              style={tw`-mb-1`}
            />
          </FadeInView>
        )}
        {/* EMPTY SPACE */}
        {!sortedUserActivities ? (
          <View style={tw`flex justify-center rounded-md mb-5 mt-4`}>
            <View style={tw`w-80 m-auto`}>
              <Text style={tw`text-center text-neutral-500 text-sm`}>
                You haven't added any activities to track yet! Activities can be
                managed from the "Activities" section of Pathize.
              </Text>
            </View>
          </View>
        ) : null}
        {/* SYMPTOMS ARE PRESENT */}
        {sortedUserActivities && sortedUserActivities.length > 0 ? (
          <FadeInView duration={200}>
            <View style={tw`mt-3`}>
              <UserTrackerList
                items={sortedUserActivities as UserActivity[]}
                screenName="AddNewActivityRecord"
                createNavigator={activityNavigation}
                editNavigator={undefined}
                multiSelectIsEnabled={false}
                trackWithAppleWatch={isEnabled}
                disableBadges={true}
                padding={false}
              />
            </View>
          </FadeInView>
        ) : null}
        {/* IF NO SYMPTOMS, SHOW ADD BUTTON */}
        {sortedUserActivities && sortedUserActivities.length === 0 && (
          <PressableCard
            onPress={() => {
              interactionEvent('Button', 'Pressed', {
                $screen_name: 'Home',
                value: 'Add a new activity',
              });

              activityNavigation.navigate('NewUserActivitySearch');
            }}
            headerText="Add a new activity"
            textChild="You haven't added any activities to track yet! Activities can be
            managed from the 'Activities' section of Pathize."
            alertChild={'+'}
            padding={true}
            headerTextStyle={[tw``, getCircular('Bold')]}
            bodyTextStyle={[tw``, getCircular('Book')]}
          />
        )}
        {/* SHOW DIVIDER AND ADD NEW ALWAYS */}
        <Divider padding={true} />
        {/* ADD NEW BUTTON */}
        <PressableCard
          onPress={() => {
            interactionEvent('Button', 'Pressed', {
              $screen_name: 'Home',
              value: 'Add a custom symptom',
            });

            activityNavigation.navigate('NewUserActivitySearch');
          }}
          headerText="Add a new activity"
          alertChild={'+'}
          padding={true}
          headerTextStyle={[tw``, getCircular('Bold')]}
          bodyTextStyle={[tw``, getCircular('Book')]}
        />
        {/* PICKER OVERLAY */}
        {pickerVisible && pickerSource === 'addNewActivityRecord' && (
          <PickerOverlaySheet
            items={dropdownItems}
            selectedItem={selectedDropdownItem}
            setSelectedItem={setSelectedDropdownItem}
            labelKey="name"
            portalHost="addNewActivityRecord"
          />
        )}
        {/* LOADING */}
        <Loading loading={loading} />
      </AppBodyLayout>
    </>
  );
};

export default AddNewActivityRecord;
