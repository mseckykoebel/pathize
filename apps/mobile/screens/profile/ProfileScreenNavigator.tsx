/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import ProfileScreen from './ProfileScreen';
import LimitsScreen from '../limits/LimitsScreen';
import NotificationsScreen from '../notifications/NotificationsScreen';
import MedicationsScreen from '../medications/MedicationsScreen';
import PersonalDetailsScreen from '../personalDetails/PersonalDetails';
import ActivitiesScreen from '../activities/ActivitiesScreen';
import DevicesScreen from '../devices/DevicesScreen';
import SymptomsScreen from '../symptoms/SymptomsScreen';

import {
  HeaderBack,
  HeaderDarkBackground,
  HeaderSort,
  HeaderTitle,
} from '../../components/layouts/NavigationLayout';
import ReferScreen from '../refer/ReferScreen';
import FAQScreen from '../faq/FAQScreen';

export type ProfileScreenParamList = {
  Profile: undefined;
  Devices: undefined;
  Limits: undefined;
  Notifications: undefined;
  UserSymptoms: undefined;
  UserMedications: undefined;
  UserActivities: undefined;
  UserCheckIns: undefined;
  PersonalDetails: undefined;
  ContactUs: undefined;
  Refer: undefined;
  FAQ: undefined;
};

const ProfileStack = createStackNavigator<ProfileScreenParamList>();

const ProfileScreenNavigator = () => {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: true,
        headerLeft: () => <HeaderBack color="white" />,
        headerStyle: {
          height: 120,
        },
      }}>
      {/* PROFILE 🕺 */}
      <ProfileStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: true,
          headerTitle: () => (
            <HeaderTitle screenName="My Account" textColor="text-white" />
          ),
          headerBackground: () => <HeaderDarkBackground />,
          headerLeft: () => undefined,
        }}
      />
      {/* DEVICES 📲 */}
      <ProfileStack.Screen
        name="Devices"
        component={DevicesScreen}
        options={{
          headerShown: true,
          headerTitle: () => (
            <HeaderTitle screenName="Devices" textColor="text-white" />
          ),
          headerBackground: () => <HeaderDarkBackground />,
        }}
      />
      {/* LIMITS 🚨 */}
      <ProfileStack.Screen
        name="Limits"
        component={LimitsScreen}
        options={{
          headerShown: true,
          headerTitle: () => (
            <HeaderTitle screenName="Limits" textColor="text-white" />
          ),
          headerBackground: () => <HeaderDarkBackground />,
        }}
      />
      {/* NOTIFICATIONS 🔔 */}
      <ProfileStack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          headerShown: true,
          headerTitle: () => (
            <HeaderTitle screenName="Notifications" textColor="text-white" />
          ),
          headerBackground: () => <HeaderDarkBackground />,
        }}
      />
      {/* SYMPTOMS */}
      <ProfileStack.Screen
        name="UserSymptoms"
        component={SymptomsScreen}
        options={{
          headerShown: true,
          headerTitle: () => (
            <HeaderTitle screenName="Symptoms" textColor="text-white" />
          ),
          headerBackground: () => <HeaderDarkBackground />,
          headerRight: () => <HeaderSort pickerSource="sortUserSymptoms" />,
        }}
      />
      {/* MEDICATIONS + SUPPLEMENTS 🚑 */}
      <ProfileStack.Screen
        name="UserMedications"
        component={MedicationsScreen}
        options={{
          headerShown: true,
          headerTitle: () => (
            <HeaderTitle screenName="Medications+" textColor="text-white" />
          ),
          headerBackground: () => <HeaderDarkBackground />,
          headerRight: () => <HeaderSort pickerSource="sortUserMedications" />,
        }}
      />
      {/* ACTIVITIES 🛌 */}
      <ProfileStack.Screen
        name="UserActivities"
        component={ActivitiesScreen}
        options={{
          headerShown: true,
          headerTitle: () => (
            <HeaderTitle screenName="Activities" textColor="text-white" />
          ),
          headerBackground: () => <HeaderDarkBackground />,
          headerRight: () => <HeaderSort pickerSource="sortUserActivities" />,
        }}
      />
      {/* CHECK-INS ✅
      <ProfileStack.Screen
        name="UserCheckIns"
        component={CheckInsScreen}
        options={{
          headerShown: true,
          headerTitle: () => (
            <HeaderTitle screenName="Check-Ins" textColor="text-white" />
          ),
          headerBackground: () => <HeaderDarkBackground />,
          headerRight: () => <HeaderSort pickerSource="sortUserCheckIns" />,
        }}
      />
      */}
      {/* PERSONAL DETAILS 📋 */}
      <ProfileStack.Screen
        name="PersonalDetails"
        component={PersonalDetailsScreen}
        options={{
          headerShown: true,
          headerTitle: () => (
            <HeaderTitle screenName="Profile" textColor="text-white" />
          ),
          headerBackground: () => <HeaderDarkBackground />,
        }}
      />
      {/* CONTACT US (DEPRECATED)
      <ProfileStack.Screen
        name="ContactUs"
        component={ContactUsScreen}
        options={{
          headerShown: true,
          headerTitle: () => (
            <HeaderTitle screenName="Contact Us" textColor="text-white" />
          ),
          headerBackground: () => <HeaderDarkBackground />,
        }}
      />
      */}
      {/* REFER SCREEN 👥 */}
      <ProfileStack.Screen
        name="Refer"
        component={ReferScreen}
        options={{
          headerShown: true,
          headerTitle: () => (
            <HeaderTitle
              screenName="Invites and Discounts"
              textColor="text-white"
            />
          ),
          headerBackground: () => <HeaderDarkBackground />,
        }}
      />
      {/* FAQ AND ROADMAP SCREEN 🗺️ */}
      <ProfileStack.Screen
        name="FAQ"
        component={FAQScreen}
        options={{
          headerShown: true,
          headerTitle: () => (
            <HeaderTitle screenName="Feature Requests" textColor="text-white" />
          ),
          headerBackground: () => <HeaderDarkBackground />,
        }}
      />
    </ProfileStack.Navigator>
  );
};

export default ProfileScreenNavigator;
