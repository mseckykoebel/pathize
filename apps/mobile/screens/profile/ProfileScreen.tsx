import React from 'react';
import {StackScreenProps} from '@react-navigation/stack';
import tw from 'twrnc';

import {Divider, Subheader} from '@pathize/mobile-ui';
import {
  MainAppLayout,
  AppBodyLayout,
  SelectListPressable,
} from '../../components';
import {getCircular} from '../../utils';
import {ProfileScreenParamList} from './ProfileScreenNavigator';

type ProfileOptionsList = {id: string; displayName: string; name: string};

const profileOptions: ProfileOptionsList[] = [
  {
    id: '0',
    displayName: 'Devices',
    name: 'Devices',
  },
  {
    id: '1',
    displayName: 'Limits',
    name: 'Limits',
  },
  {
    id: '2',
    displayName: 'Notifications',
    name: 'Notifications',
  },
  {
    id: '3',
    displayName: 'Symptoms',
    name: 'UserSymptoms',
  },
  {
    id: '4',
    displayName: 'Activities',
    name: 'UserActivities',
  },
  {
    id: '5',
    displayName: 'Medications+',
    name: 'UserMedications',
  },
  {
    id: '6',
    displayName: 'Check-Ins',
    name: 'UserCheckIns',
  },
  {
    id: '7',
    displayName: 'Profile',
    name: 'PersonalDetails',
  },
];

const otherOptions: ProfileOptionsList[] = [
  {
    id: '8',
    displayName: 'Contact us',
    name: 'ContactUs',
  },
  {
    id: '9',
    displayName: 'Invites and Discounts',
    name: 'Refer',
  },
  {
    id: '10',
    displayName: 'Feature Requests',
    name: 'FAQ',
  },
];

type Props = StackScreenProps<ProfileScreenParamList, 'Profile'>;

const ProfileScreen: React.FC<Props> = ({navigation}) => {
  return (
    <MainAppLayout statusBarStyle="light-content">
      <AppBodyLayout
        avoidKeyboard={false}
        scrollable={true}
        dismissKeyboardOnTouch={false}>
        {/* SUBHEADER */}
        <Subheader
          text="Manage connected devices, add and remove things you'd like to track, and edit your personal details."
          style={[tw``, getCircular('Book')]}
        />
        <SelectListPressable
          items={profileOptions}
          navigation={navigation}
          style={tw`mt-3`}
        />
        <Divider padding={true} />
        <SelectListPressable
          items={otherOptions}
          navigation={navigation}
          style={tw``}
        />
      </AppBodyLayout>
    </MainAppLayout>
  );
};

export default ProfileScreen;
