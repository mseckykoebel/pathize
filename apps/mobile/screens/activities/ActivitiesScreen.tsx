import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StackScreenProps} from '@react-navigation/stack';
import tw from 'twrnc';

import {UserActivity} from '@pathize/db';
import {
  FadeInFadeOut,
  Loading,
  PressableCard,
  Subheader,
} from '@pathize/mobile-ui';
import {ProfileScreenParamList} from '../profile/ProfileScreenNavigator';
import {AppBodyLayout, MainAppLayout} from '../../components/layouts';
import {DropdownItem} from '../../components/elements';
import {getSortedItems} from '../../lib';
import {useActivitiesContext, useOverlayContext} from '../../contexts';
import {PickerOverlaySheet} from '../../components/sheets';
import {getCircular} from '../../utils';
import {useAnalytics} from '../../hooks';
import {UserTrackerList} from '../../features/records';

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

type Props = StackScreenProps<ProfileScreenParamList, 'UserActivities'>;

const ActivitiesScreen: React.FC<Props> = () => {
  const {userActivities, getUserActivities, userActivitiesLoading} =
    useActivitiesContext();
  const {pickerVisible, pickerSource} = useOverlayContext();
  const [selectedDropdownItem, setSelectedDropdownItem] =
    useState<DropdownItem | null>(null);
  const activitiesNavigation = useNavigation<any>();
  const {interfaceEvent, interactionEvent} = useAnalytics();

  const sortedUserActivities =
    userActivities && getSortedItems(userActivities, selectedDropdownItem);

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

  useEffect(() => {
    interfaceEvent('Loaded', {
      $screen_name: 'UserActivities',
    });
    getUserActivities();
  }, [getUserActivities, interfaceEvent]);

  return (
    <MainAppLayout statusBarStyle="light-content">
      <AppBodyLayout scrollable={true} dismissKeyboardOnTouch={false}>
        {/* TOP SUBHEADER */}
        <Subheader
          text="This is where you add and manage all the activities you'd like to track. You can record an activity from the home screen."
          style={[tw``, getCircular('Book')]}
        />
        {/* ADD NEW BUTTON */}
        <PressableCard
          onPress={() => {
            interactionEvent('Button', 'Pressed', {
              $screen_name: 'UserActivities',
              value: 'Add a new activity',
            });

            activitiesNavigation.navigate('Activities', {
              screen: 'NewUserActivitySearch',
            });
          }}
          headerText="Add a new activity"
          textChild="You can choose from our catalogue, or add your own."
          alertChild={'+'}
          padding={true}
          headerTextStyle={[tw``, getCircular('Bold')]}
          bodyTextStyle={[tw``, getCircular('Book')]}
        />
        {/* ACTIVITIES LIST */}
        {sortedUserActivities && (
          <FadeInFadeOut watchValue={sortedUserActivities.length !== 0}>
            <UserTrackerList
              screenName="UserActivities"
              items={sortedUserActivities as UserActivity[]}
              editNavigator={activitiesNavigation}
            />
          </FadeInFadeOut>
        )}
        {/* PICKER OVERLAY */}
        {pickerVisible && pickerSource === 'sortUserActivities' && (
          <PickerOverlaySheet
            items={dropdownItems}
            selectedItem={selectedDropdownItem}
            setSelectedItem={setSelectedDropdownItem}
            labelKey="name"
            portalHost="sortUserActivities"
          />
        )}
        {/* LOADING */}
        <Loading loading={userActivitiesLoading} />
      </AppBodyLayout>
    </MainAppLayout>
  );
};

export default ActivitiesScreen;
