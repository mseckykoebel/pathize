import React, {useEffect, useState} from 'react';
import {
  faChartLine,
  faHome,
  faUser,
  faMessage,
} from '@fortawesome/free-solid-svg-icons';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import {PathizeIcon} from '@pathize/mobile-ui';
import {TrendsScreen} from '../trends/TrendsScreen';
import ProfileScreenNavigator from '../profile/ProfileScreenNavigator';
import {HeaderDarkBackground, HeaderTitle} from '../../components/layouts';
import AskScreen from '../ask/AskScreen';
import {useAnalytics} from '../../hooks';
import {HomeScreen} from '..';

const Tab = createBottomTabNavigator<TabbedNavigatorParamList>();

export type TabbedNavigatorParamList = {
  HomeScreen: {referralCode?: string} | undefined;
  TrendsScreen: undefined;
  AskScreen: undefined;
  ProfileScreen: undefined;
};

export const HomeTabs: React.FC = () => {
  const [, setAskScreenFlag] = useState<string | null>(null);
  const {featureFlag} = useAnalytics();

  useEffect(() => {
    const flag = featureFlag('FF-F-2');
    if (flag === undefined) {
      setAskScreenFlag(null);
    } else if (typeof flag === 'boolean') {
      setAskScreenFlag(null);
    } else {
      setAskScreenFlag(flag);
    }
  }, [featureFlag]);

  return (
    <Tab.Navigator
      initialRouteName="HomeScreen"
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: '#082F49',
        },
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#ffffff',
          borderWidth: 0,
          height: 90,
          padding: 9,
          paddingHorizontal: 40,
        },
        tabBarActiveTintColor: '#00373E',
        tabBarInactiveTintColor: '#00373E',
        tabBarLabelStyle: {
          fontSize: 16,
          fontFamily: 'CircularStd-Medium',
        },
      }}>
      {/* HOME SCREEN */}
      <Tab.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: () => {
            return <PathizeIcon iconColor="#00373E" icon={faHome} size={24} />;
          },
        }}
      />
      {/* TRENDS SCREEN */}
      <Tab.Screen
        name="TrendsScreen"
        component={TrendsScreen}
        options={{
          headerStyle: {
            height: 120,
          },
          lazy: false,
          title: 'Trends',
          headerShown: true,
          headerTitle: () => (
            <HeaderTitle screenName="Trends" textColor="text-white" />
          ),
          headerBackground: () => <HeaderDarkBackground />,
          headerLeft: () => undefined,
          tabBarIcon: () => {
            return (
              <PathizeIcon iconColor="#00373E" icon={faChartLine} size={24} />
            );
          },
        }}
      />
      {/* ASK SCREEN */}
      <Tab.Screen
        name="AskScreen"
        component={AskScreen}
        options={{
          headerStyle: {
            height: 120,
          },
          lazy: false,
          title: 'Ask',
          headerShown: true,
          headerTitle: () => (
            <HeaderTitle screenName="Ask" textColor="text-white" />
          ),
          headerBackground: () => <HeaderDarkBackground />,
          headerLeft: () => undefined,
          tabBarIcon: () => {
            return (
              <PathizeIcon iconColor="#00373E" icon={faMessage} size={24} />
            );
          },
        }}
      />
      {/* PROFILE SCREEN */}
      <Tab.Screen
        name="ProfileScreen"
        component={ProfileScreenNavigator}
        options={{
          lazy: false,
          title: 'Account',
          tabBarIcon: () => {
            return <PathizeIcon iconColor="#00373E" icon={faUser} size={24} />;
          },
        }}
      />
    </Tab.Navigator>
  );
};
