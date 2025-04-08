import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tw from 'twrnc';

import {Loading, PressableCard, Subheader} from '@pathize/mobile-ui';
import {UserMedication} from '@pathize/db';
import {ProfileScreenParamList} from '../profile/ProfileScreenNavigator';
import {AppBodyLayout, MainAppLayout} from '../../components/layouts';
import {useMedicationsContext, useOverlayContext} from '../../contexts';
import {DropdownItem} from '../../components/elements';
import {getSortedItems} from '../../lib';
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

type Props = StackScreenProps<ProfileScreenParamList, 'UserMedications'>;

const MedicationsScreen: React.FC<Props> = () => {
  const {getUserMedications, userMedications, userMedicationsLoading} =
    useMedicationsContext();
  const {pickerVisible, pickerSource} = useOverlayContext();
  const {interfaceEvent, interactionEvent} = useAnalytics();
  const medicationNavigation = useNavigation<any>();

  const [selectedDropdownItem, setSelectedDropdownItem] =
    useState<DropdownItem | null>(null);

  const sortedUserMedications =
    userMedications && getSortedItems(userMedications, selectedDropdownItem);

  useEffect(() => {
    interfaceEvent('Loaded', {
      $screen_name: 'UserMedications',
    });
  }, [interfaceEvent]);

  useEffect(() => {
    const getSavedMedicationsFilter = async () => {
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

    getSavedMedicationsFilter();
  }, [selectedDropdownItem]);

  useEffect(() => {
    getUserMedications();
  }, [getUserMedications]);

  return (
    <MainAppLayout statusBarStyle="light-content">
      <AppBodyLayout
        avoidKeyboard={false}
        scrollable={true}
        dismissKeyboardOnTouch={false}>
        {/* TOP SUBHEADER */}
        <Subheader
          text="This is where you add and manage the medications and supplements you take for your condition."
          style={[tw``, {fontFamily: 'CircularStd-Book'}]}
        />
        {/* ADD NEW BUTTON */}
        <PressableCard
          onPress={() => {
            interactionEvent('Button', 'Pressed', {
              $screen_name: 'UserMedications',
              value: 'Add a new medication+',
            });

            medicationNavigation.navigate('Medications', {
              screen: 'NewUserMedicationSearch',
            });
          }}
          headerText="Add a new medication+"
          textChild="You can choose from our catalogue, or add your own."
          alertChild={'+'}
          padding={true}
          headerTextStyle={[tw``, getCircular('Bold')]}
          bodyTextStyle={[tw``, getCircular('Book')]}
        />
        {/* MEDICATIONS LIST */}
        {sortedUserMedications && (
          <View style={tw`pb-20`}>
            <UserTrackerList
              screenName="UserMedications"
              items={sortedUserMedications as UserMedication[]}
              editNavigator={medicationNavigation}
            />
          </View>
        )}
        {/* PICKER OVERLAY */}
        {pickerVisible && pickerSource === 'sortUserMedications' && (
          <PickerOverlaySheet
            items={dropdownItems}
            selectedItem={selectedDropdownItem}
            setSelectedItem={setSelectedDropdownItem}
            labelKey="name"
            portalHost="sortUserMedications"
          />
        )}
        {/* LOADING */}
        <Loading loading={userMedicationsLoading} />
      </AppBodyLayout>
    </MainAppLayout>
  );
};

export default MedicationsScreen;
