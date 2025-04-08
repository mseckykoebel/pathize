import React, {useEffect} from 'react';
import {View} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {faCheckCircle} from '@fortawesome/free-solid-svg-icons';
import tw from 'twrnc';

import {UserActivity, UserSymptom, UserMedication} from '@pathize/db';
import {ListItem, PathizeIcon} from '@pathize/mobile-ui';
import {getCircular, getIcon} from '../../../utils';
import {AllScreenParams, useAnalytics, useMultiSelect} from '../../../hooks';
import BadgeChild from './BadgeChild';
import {ButtonOverlaySheet} from '../../../components/sheets';

const ItemSeparator = () => <View style={tw`my-1.5`} />;

type TrackerItem = UserActivity | UserSymptom | UserMedication;

// Type guards to determine if the item is a UserSymptom or UserMedication
const isUserActivity = (item: TrackerItem): item is UserActivity =>
  'activityId' in item;
const isUserSymptom = (item: TrackerItem): item is UserSymptom =>
  'symptomId' in item;
const isUserMedication = (item: TrackerItem): item is UserMedication =>
  'medicationId' in item;

type UserTrackerListProps = {
  items: TrackerItem[]; // items to render
  initialSelectedItems?: TrackerItem[]; // if there are items that we want initially selected in multi-select mode
  screenName: AllScreenParams; // name of the screen for event tracking
  padding?: boolean;
  createNavigator?: any; // TODO: Fix this type
  editNavigator?: any; // TODO: Fix this type
  additionalNavigationParams?: Record<string, string | unknown>;
  isCheckIn?: boolean;
  trackWithAppleWatch?: boolean;
  multiSelectIsEnabled?: boolean;
  multiSelectButtonText?: string;
  disableBadges?: boolean;
};

export const UserTrackerList: React.FC<UserTrackerListProps> = ({
  items,
  initialSelectedItems,
  createNavigator,
  editNavigator,
  additionalNavigationParams,
  isCheckIn = false,
  screenName,
  padding = true,
  trackWithAppleWatch,
  multiSelectIsEnabled = false,
  multiSelectButtonText = 'Confirm',
  disableBadges = false,
}) => {
  const {interactionEvent} = useAnalytics();
  const {
    selectedItems,
    multiSelectEnabled,
    toggleSelection,
    enableMultiSelect,
    setMultiSelectEnabled,
    disableMultiSelect,
  } = useMultiSelect<string>();

  /**
   * @description based on where this list is placed, upon a successful single or multi-selection, there are lots of
   * places that we can go. this handles the different navigations based on the type of item and the type of navigation
   */
  const navigationMap = {
    // the case where we are navigating creating or editing something requiring user activities
    UserActivity: {
      newItem: (item: TrackerItem | TrackerItem[]) => {
        // if array return
        if (Array.isArray(item)) return;
        if (isUserActivity(item)) {
          const route = trackWithAppleWatch
            ? 'NewActivityRecordAppleWatch'
            : 'ConfirmNewActivityRecord';
          createNavigator.navigate(route, {activity: item});
        }
      },
      editItem: (item: TrackerItem | TrackerItem[]) => {
        // if array return
        if (Array.isArray(item)) return;
        if (isUserActivity(item)) {
          editNavigator.navigate('Activities', {
            screen: 'EditUserActivity',
            params: {activity: item},
          });
        }
      },
    },
    // the case where we are navigating creating or editing something requiring user symptoms
    UserSymptom: {
      newItem: (item: TrackerItem | TrackerItem[]) => {
        if (Array.isArray(item)) {
          const route = isCheckIn
            ? 'NewCheckInConfirm'
            : 'ConfirmNewSymptomRecord';
          const params = isCheckIn
            ? {checkIn: {...additionalNavigationParams, symptoms: item}}
            : {symptoms: item};
          createNavigator.navigate(route, params);
        } else if (isUserSymptom(item)) {
          const route = isCheckIn
            ? 'NewCheckInConfirm'
            : 'ConfirmNewSymptomRecord';
          const modItem = isCheckIn ? [item] : item; // ensure it is an array of items if it is a check in
          const params = isCheckIn
            ? {checkIn: {...additionalNavigationParams, symptoms: modItem}}
            : {symptoms: modItem};
          createNavigator.navigate(route, params);
        }
      },
      editItem: (item: TrackerItem | TrackerItem[]) => {
        // if array return
        if (Array.isArray(item)) {
          editNavigator.navigate('EditCheckIn', {
            checkIn: {...additionalNavigationParams},
            symptoms: item,
          });
        } else if (isUserSymptom(item)) {
          const route = isCheckIn ? 'EditCheckIn' : 'Symptoms';
          const modItem = isCheckIn ? [item] : item; // ensure it is an array of items if it is a check in
          const params = isCheckIn
            ? {checkIn: additionalNavigationParams, symptoms: modItem}
            : {};
          editNavigator.navigate(route, params);
        }
      },
    },
    // the case where we are navigating creating or editing something requiring user medications
    UserMedication: {
      newItem: (item: TrackerItem | TrackerItem[]) => {
        if (Array.isArray(item)) {
          const route = isCheckIn
            ? 'NewCheckInSymptoms' // navigate to next page in check-in flow
            : 'ConfirmNewMedicationRecord'; // navigate to next page in add new medication record flow
          const params = isCheckIn
            ? {checkIn: {...additionalNavigationParams, medications: item}}
            : {medications: item};
          createNavigator.navigate(route, params);
        } else if (isUserMedication(item)) {
          const route = isCheckIn
            ? 'NewCheckInSymptoms'
            : 'ConfirmNewMedicationRecord';
          const modItem = isCheckIn ? [item] : item; // ensure it is an array of items if it is a check in
          const params = isCheckIn
            ? {checkIn: {...additionalNavigationParams, medications: modItem}}
            : {medications: modItem};
          createNavigator.navigate(route, params);
        }
      },
      editItem: (item: TrackerItem | TrackerItem[]) => {
        // if editing an array of items, we know we are editing a check-in, and we can just go back
        if (Array.isArray(item)) {
          editNavigator.navigate('EditCheckIn', {
            checkIn: {...additionalNavigationParams},
            medications: item,
          });
        } else if (isUserMedication(item)) {
          const route = isCheckIn ? 'EditCheckIn' : 'Medications';
          const modItem = isCheckIn ? [item] : item; // ensure it is an array of items if it is a check in
          const params = isCheckIn
            ? {checkIn: additionalNavigationParams, medications: modItem}
            : {};
          editNavigator.navigate(route, params);
        } else {
          return;
        }
      },
    },
  };

  const handleSingleItemNavigation = (itemPressed: TrackerItem) => {
    const itemType = isUserActivity(itemPressed)
      ? 'UserActivity'
      : isUserSymptom(itemPressed)
        ? 'UserSymptom'
        : 'UserMedication';

    const navigator = createNavigator ? 'newItem' : 'editItem';
    navigationMap[itemType][navigator](itemPressed);
    console.log('NAVIGATING TO: ', itemType, navigator);
  };

  // Handle navigation if there are more than one selected
  const handleMultiItemNavigation = () => {
    const firstItem = selectedItems.values().next().value;
    const firstItemTrackerItem = items.find(
      item => item.id === firstItem,
    ) as TrackerItem;
    const allItems = Array.from(selectedItems)
      .map(id => items.find(item => item.id === id))
      .filter(item => item !== undefined) as TrackerItem[];

    const itemType = isUserActivity(firstItemTrackerItem)
      ? 'UserActivity'
      : isUserSymptom(firstItemTrackerItem)
        ? 'UserSymptom'
        : 'UserMedication';

    const navigator = createNavigator ? 'newItem' : 'editItem';
    navigationMap[itemType][navigator](allItems);
  };

  const renderItem = ({item}: {item: TrackerItem}) => {
    // Use type guards to determine the type of item and set the icon and other properties accordingly
    const itemIcon = isUserActivity(item)
      ? item.activityIcon
      : isUserSymptom(item)
        ? (item.category as string)
        : 'Medication';
    const itemTitle = isUserActivity(item)
      ? item.activityName
      : isUserSymptom(item)
        ? item.name
        : item.medicationName;

    // Handle navigation and event tracking for pressing
    const handleItemPress = (itemPressed: TrackerItem) => {
      interactionEvent('Item', multiSelectEnabled ? 'Selected' : 'Pressed', {
        $screen_name: screenName,
        value: itemTitle,
      });

      // only perform the multi-select action if multi-select is enabled
      if (multiSelectEnabled && multiSelectIsEnabled) {
        toggleSelection(itemPressed.id); // add or remove item from set
      } else {
        handleSingleItemNavigation(itemPressed);
      }
    };

    // handle the initial long press of an item
    const handleLongPress = (itemPressed: TrackerItem) => {
      multiSelectIsEnabled && enableMultiSelect(itemPressed.id);
    };

    // Check if the current item is selected
    const isSelected = selectedItems.has(item.id);
    const itemIconBasedOnIfSelected = isSelected
      ? faCheckCircle
      : getIcon(itemIcon);

    return (
      <ListItem
        key={item.id}
        title={itemTitle}
        padding={padding}
        border={isSelected}
        itemIcon={<PathizeIcon icon={itemIconBasedOnIfSelected} size={24} />}
        titleStyle={getCircular('Bold')}
        badgeChild={!disableBadges && <BadgeChild item={item} />}
        onPress={() => handleItemPress(item)}
        onLongPress={() => handleLongPress(item)}
      />
    );
  };

  /**
   * @description if we are in multi-select mode, and there are initially selected items,
   * we need to 1) add them to the multi-select set and 2) enable multi-select mode.
   * this makes sure the initial UI shows the initially selected items
   */
  useEffect(() => {
    if (multiSelectIsEnabled && initialSelectedItems !== undefined) {
      initialSelectedItems?.forEach(item => toggleSelection(item.id));
      setMultiSelectEnabled(true); // enable multi-select inside of the hook manually
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* LIST */}
      <FlatList
        key={items.length}
        scrollEnabled={false}
        data={items}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={ItemSeparator}
      />
      {/* OVERLAY FOR MULTI-SELECT CONTINUE */}
      {multiSelectEnabled && multiSelectIsEnabled && (
        <ButtonOverlaySheet
          buttonText={multiSelectButtonText}
          onPress={() => {
            interactionEvent('Button', 'Pressed', {
              $screen_name: screenName,
              value: multiSelectButtonText,
            });

            disableMultiSelect(); // clear multi-select set if we need to navigate back we need to re-select these items
            handleMultiItemNavigation();
          }}
          screenName={screenName}
        />
      )}
    </>
  );
};
