import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StackScreenProps} from '@react-navigation/stack';
import tw from 'twrnc';

import {CheckInComplete} from '@pathize/db';
import {
  FadeInFadeOut,
  Loading,
  PressableCard,
  Subheader,
} from '@pathize/mobile-ui';
import {ProfileScreenParamList} from '../profile/ProfileScreenNavigator';
import {AppBodyLayout, MainAppLayout} from '../../components/layouts';
import {DropdownItem} from '../../components/elements';
import {useCheckInsContext, useOverlayContext} from '../../contexts';
import {PickerOverlaySheet} from '../../components/sheets';
import {getCircular} from '../../utils';
import {useAnalytics} from '../../hooks';
import {CheckInsList} from '../../features/checkIns';
import {getSortedItems} from '../../lib';

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

type Props = StackScreenProps<ProfileScreenParamList, 'UserCheckIns'>;

const CheckInsScreen: React.FC<Props> = () => {
  const {pickerSource, pickerVisible} = useOverlayContext();
  const {checkIns, getCheckIns, getCheckInsLoading} = useCheckInsContext();
  const [selectedDropdownItem, setSelectedDropdownItem] =
    useState<DropdownItem | null>(null);
  const checkInsNavigation = useNavigation<any>();
  const {interfaceEvent, interactionEvent} = useAnalytics();

  const sortedCheckIns =
    checkIns.length > 0 && getSortedItems(checkIns, selectedDropdownItem);

  useEffect(() => {
    const getSavedCheckInsFilter = async () => {
      if (selectedDropdownItem) {
        await AsyncStorage.setItem(
          'checkInsSortOrderId',
          JSON.stringify(selectedDropdownItem),
        );
        return;
      }

      const savedDropdownItem = await AsyncStorage.getItem(
        'checkInsSortOrderId',
      );
      if (!savedDropdownItem || savedDropdownItem === 'null') {
        setSelectedDropdownItem(dropdownItems[0]);
      } else {
        setSelectedDropdownItem(JSON.parse(savedDropdownItem));
      }
    };

    getSavedCheckInsFilter();
  }, [selectedDropdownItem]);

  useEffect(() => {
    interfaceEvent('Loaded', {
      $screen_name: 'UserCheckIns',
    });
    getCheckIns();
  }, [getCheckIns, interfaceEvent]);

  return (
    <MainAppLayout statusBarStyle="light-content">
      <AppBodyLayout scrollable={true} dismissKeyboardOnTouch={false}>
        {/* TOP SUBHEADER */}
        <Subheader
          text="With-check-ins, you can group medications and symptoms together and be reminded to take them at the same time each day."
          paddingBottom={true}
          style={[tw``, getCircular('Book')]}
        />
        {/* ADD NEW BUTTON */}
        <PressableCard
          onPress={() => {
            console.log('pressed');
            interactionEvent('Button', 'Pressed', {
              $screen_name: 'CheckIns',
              value: 'Create a new check-in',
            });

            checkInsNavigation.navigate('CheckIns', {
              screen: 'NewCheckInNameAndTime',
            });
          }}
          headerText="Create a new check-in"
          textChild="Check-ins are groupings of medications+ and symptoms that you can configure to be reminded to take at the same time each day."
          alertChild={'+'}
          padding={true}
          headerTextStyle={[tw``, getCircular('Bold')]}
          bodyTextStyle={[tw``, getCircular('Book')]}
        />
        {/* LIST OF CHECK-INS LIST */}
        {sortedCheckIns && (
          <FadeInFadeOut watchValue={sortedCheckIns.length !== 0}>
            <>
              <CheckInsList
                checkIns={sortedCheckIns as CheckInComplete[]}
                screenName="CheckIns"
                navigation={checkInsNavigation}
              />
            </>
          </FadeInFadeOut>
        )}
        {/* PICKER OVERLAY */}
        {pickerVisible && pickerSource === 'sortUserCheckIns' && (
          <PickerOverlaySheet
            items={dropdownItems}
            selectedItem={selectedDropdownItem}
            setSelectedItem={setSelectedDropdownItem}
            labelKey="name"
            portalHost="sortUserCheckIns"
          />
        )}
        {/* LOADING */}
        <Loading loading={getCheckInsLoading} padding={true} />
      </AppBodyLayout>
    </MainAppLayout>
  );
};

export default CheckInsScreen;
