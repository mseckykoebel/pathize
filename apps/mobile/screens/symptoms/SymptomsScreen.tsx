import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tw from 'twrnc';

import {UserSymptom} from '@pathize/db';
import {ProfileScreenParamList} from '../profile/ProfileScreenNavigator';
import {MainAppLayout, AppBodyLayout} from '../../components/layouts';
import {useOverlayContext, useSymptomsContext} from '../../contexts';
import {DropdownItem} from '../../components/elements';
import {getSortedItems} from '../../lib';
import {Loading, PressableCard, Subheader} from '@pathize/mobile-ui';
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

type Props = StackScreenProps<ProfileScreenParamList, 'UserSymptoms'>;

const SymptomsScreen: React.FC<Props> = () => {
  const {
    userSymptoms,
    getUserSymptoms,
    getUserSymptomsLoading: loading,
  } = useSymptomsContext();
  const {pickerVisible} = useOverlayContext();
  const {interactionEvent} = useAnalytics();
  const symptomNavigation = useNavigation<any>();

  const [selectedDropdownItem, setSelectedDropdownItem] =
    useState<DropdownItem | null>(null);

  const sortedUserSymptoms =
    userSymptoms && getSortedItems(userSymptoms, selectedDropdownItem);

  useEffect(() => {
    const getSavedSymptomsFilter = async () => {
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

    getSavedSymptomsFilter();
  }, [selectedDropdownItem]);

  useEffect(() => {
    getUserSymptoms();
  }, [getUserSymptoms]);

  return (
    <MainAppLayout statusBarStyle="light-content">
      <AppBodyLayout
        avoidKeyboard={false}
        scrollable={true}
        dismissKeyboardOnTouch={false}>
        {/* TOP SUBHEADER */}
        <Subheader
          text="Symptoms is where add and manage symptoms you'd like to track. You can track symptoms you add here on the home screen."
          style={[tw``, getCircular('Book')]}
        />
        {/* ADD NEW BUTTON */}
        <PressableCard
          onPress={() => {
            interactionEvent('Button', 'Pressed', {
              $screen_name: 'UserActivities',
              value: 'Add a new symptom',
            });

            symptomNavigation.navigate('Symptoms', {
              screen: 'NewUserSymptomSearch',
            });
          }}
          headerText="Add a new symptom"
          textChild="You can choose from our catalogue, or add your own."
          alertChild={'+'}
          padding={true}
          headerTextStyle={[tw``, getCircular('Bold')]}
          bodyTextStyle={[tw``, getCircular('Book')]}
        />

        {/* SYMPTOMS LIST LIST */}
        {sortedUserSymptoms && (
          <View style={tw`pb-20`}>
            <UserTrackerList
              screenName="UserSymptoms"
              items={sortedUserSymptoms as UserSymptom[]}
              editNavigator={symptomNavigation}
            />
          </View>
        )}
        {/* PICKER OVERLAY */}
        {pickerVisible && (
          <PickerOverlaySheet
            items={dropdownItems}
            selectedItem={selectedDropdownItem}
            setSelectedItem={setSelectedDropdownItem}
            labelKey="name"
          />
        )}
        {/* LOADING */}
        <Loading loading={loading} />
      </AppBodyLayout>
    </MainAppLayout>
  );
};

export default SymptomsScreen;
