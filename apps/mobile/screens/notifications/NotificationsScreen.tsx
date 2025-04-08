import React, {Dispatch, SetStateAction, useEffect, useState} from 'react';
import {ActivityIndicator, Text, View} from 'react-native';
import {trigger} from 'react-native-haptic-feedback';
import {DrawerScreenProps} from '@react-navigation/drawer';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import tw from 'twrnc';

import {ProfileScreenParamList} from '../profile/ProfileScreenNavigator';
import {MainAppLayout, AppBodyLayout} from '../../components/layouts';
import {useAnalytics, useNotificationsStatus} from '../../hooks';
import {
  Alert,
  Divider,
  ToggleSwitch,
  ListBox,
  PrimaryButton,
  Header2,
  Subheader,
  CheckBox,
  Disabled,
  FadeInFadeOut,
  Badge,
} from '@pathize/mobile-ui';
import {
  useNotificationPreferences,
  useNotifications,
} from '../../hooks/notifications/useNotifications';
import {getCircular} from '../../utils';

const AlertChild: React.FC = () => {
  return (
    <Text style={tw`text-center text-zinc-900 text-xs font-medium`}>!</Text>
  );
};

const TextChild: React.FC = () => {
  return (
    <Text style={tw`text-black text-sm`}>
      To receive notifications from Pathize, pease grant notification access
    </Text>
  );
};

const ErrorTextChild: React.FC = () => {
  return (
    <Text style={tw`text-black text-sm`}>
      We ran into an issue processing that request. Please try again in a few
      minutes, or reach out to us for help.
    </Text>
  );
};

const NotificationsDisabled: React.FC<{
  requestPermission: () => Promise<void>;
}> = ({requestPermission}) => {
  return (
    <Alert
      headerText="Notification access needed"
      alertChild={<AlertChild />}
      textChild={<TextChild />}
      bottomChild={
        <PrimaryButton
          rounded="small"
          text="Enable notifications"
          onPress={() => {
            trigger('impactLight');
            requestPermission();
          }}
        />
      }
    />
  );
};

const Error: React.FC = () => {
  return (
    <Alert
      headerText="There was an error"
      alertChild={<AlertChild />}
      textChild={<ErrorTextChild />}
    />
  );
};

const ToggleSwitchChild: React.FC<{
  switcher: Dispatch<SetStateAction<boolean>>;
  onSwitch?: () => void;
  value: boolean;
}> = ({switcher, onSwitch, value}) => {
  return (
    <ToggleSwitch
      isEnabled={value}
      onValueChange={() => {
        onSwitch && onSwitch();
        trigger('impactLight');
        toggleSwitch(switcher);
      }}
    />
  );
};

const LeftTextChild: React.FC<{text: string}> = ({text}) => {
  return (
    <Text
      style={[
        getCircular('Book'),
        tw`h-6 text-black text-opacity-80 text-base leading-tight`,
      ]}>
      {text}
    </Text>
  );
};

// handle generic toggling
const toggleSwitch = (switcher: Dispatch<SetStateAction<boolean>>) =>
  switcher(previousState => !previousState);

type Props = DrawerScreenProps<ProfileScreenParamList, 'Notifications'>;

const NotificationsScreen: React.FC<Props> = () => {
  const {requestPermission, isAuthorized} = useNotificationsStatus();
  const {
    notificationsEnabled,
    updateNotificationPreferences,
    loading: notificationsEnabledLoading,
    error: notificationsLoadingError,
  } = useNotificationPreferences();
  const {
    energyNotification,
    updateNotification,
    loading: notificationsLoading,
    error: notificationsError,
  } = useNotifications();
  const {interactionEvent} = useAnalytics();
  const profileNavigation =
    useNavigation<
      StackNavigationProp<ProfileScreenParamList, 'Notifications'>
    >();

  // local state, just for getting the initial date, and updating the UI
  const [energyNotificationsEnabled, setEnergyNotificationsEnabled] = useState<
    boolean | null
  >(null);
  const [notificationsEnabledToggle, setNotificationsEnabledToggle] = useState<
    boolean | null
  >(null);

  /**
   * Eager update notification toggle UI and entry in backend
   */
  const setNotificationsToggle = async () => {
    if (notificationsEnabledToggle === null) return;
    setNotificationsEnabledToggle(!notificationsEnabledToggle);
    const updatePreferences = await updateNotificationPreferences(
      !notificationsEnabledToggle,
    );
    if (!updatePreferences.success) {
      setNotificationsEnabledToggle(notificationsEnabledToggle);
    }
  };

  /**
   * Eager update energy check mark and entry in backend
   */
  const updateCheck = async () => {
    const status = energyNotificationsEnabled as boolean;
    setEnergyNotificationsEnabled(!status);
    if (energyNotification) {
      const update = await updateNotification(
        energyNotification.id,
        null,
        null,
        !status,
        'ENERGY',
      );

      // if not a success, revert back
      if (!update.success) {
        setEnergyNotificationsEnabled(status);
      }
    }
  };

  useEffect(() => {
    if (energyNotification) {
      setEnergyNotificationsEnabled(energyNotification.enabled);
    }

    if (notificationsEnabled !== null) {
      setNotificationsEnabledToggle(notificationsEnabled);
    }
  }, [energyNotification, notificationsEnabled]);

  const showUI =
    energyNotification !== null && notificationsEnabledToggle !== null;
  const loading =
    notificationsEnabledLoading === true || notificationsLoading === true;
  const error =
    notificationsLoadingError === true ||
    notificationsError === true ||
    (!showUI && !loading);

  return (
    <MainAppLayout statusBarStyle="light-content">
      <AppBodyLayout
        scrollable={true}
        avoidKeyboard={false}
        dismissKeyboardOnTouch={false}>
        {/* IF NOT AUTHORIZED */}
        {!isAuthorized ? (
          <NotificationsDisabled requestPermission={requestPermission} />
        ) : (
          <>
            {showUI && (
              <>
                <ListBox
                  paddingSides={false}
                  border={false}
                  textChild={<LeftTextChild text="Notifications" />}
                  rightChild={
                    <ToggleSwitchChild
                      switcher={setNotificationsToggle}
                      onSwitch={() => {
                        interactionEvent('Switch', 'Toggled', {
                          $screen_name: 'RecordCheckIn',
                          value: notificationsEnabledToggle,
                        });
                      }}
                      value={notificationsEnabledToggle}
                    />
                  }
                />
                <Disabled disabled={notificationsEnabled as boolean}>
                  <Divider padding={true} />
                  <View style={tw`flex flex-row justify-start items-center`}>
                    <Header2
                      text="Energy budget"
                      padding={true}
                      textStyle={[
                        tw`font-semibold text-slate-950`,
                        getCircular('Book'),
                      ]}
                    />
                    <Badge
                      text="Coming soon"
                      textSize="xs"
                      rounded="large"
                      style={tw`ml-3`}
                    />
                  </View>
                  <Subheader
                    text="We'll send you notifications throughout the day summarizing how you're using your energy."
                    style={[tw``, getCircular('Book')]}
                  />
                  <ListBox
                    style={tw`my-3`}
                    paddingSides={true}
                    border={true}
                    textChild={<LeftTextChild text="Energy notifications" />}
                    rightChild={
                      <CheckBox
                        checked={energyNotificationsEnabled as boolean}
                        onValueChange={() => {
                          updateCheck();
                        }}
                        padding={false}
                      />
                    }
                  />
                  <Divider padding={true} />
                  <Header2
                    text="Check-ins"
                    padding={true}
                    textStyle={[
                      tw`font-semibold text-slate-950`,
                      getCircular('Book'),
                    ]}
                  />
                  <Subheader
                    paddingBottom={true}
                    text="Check-ins are scheduled reminders to record medications and/or symptoms. You can enable or disable notifications for each check-in."
                    style={[tw``, getCircular('Book')]}
                  />
                  <PrimaryButton
                    padding={true}
                    text="Manage check-ins"
                    rounded="small"
                    onPress={() => {
                      interactionEvent('Button', 'Pressed', {
                        $screen_name: 'Notifications',
                        value: 'Manage check-ins',
                      });

                      profileNavigation.navigate('UserCheckIns');
                    }}
                  />
                  {/*
                MORNING AND EVENING REMINDERS DEPRECATED


                  <Header2
                    text="Reminders"
                    padding={true}
                    textStyle={[
                      tw`font-semibold text-slate-950`,
                      getCircular('Book'),
                    ]}
                  />
                  <Subheader
                    text="We'll send you a reminder to track things inside Pathize every morning and evening"
                    style={[tw``, getCircular('Book')]}
                  />
                  <View style={tw`flex flex-col my-3`}>

                    <ListBox
                      style={tw`mb-3`}
                      paddingSides={true}
                      border={true}
                      textChild={<LeftTextChild text="Morning reminder" />}
                      rightChild={
                        <DateTimePicker
                          onChange={(event, date) => {
                            if (!date) return;
                            setDate(event, date, 'MORNING_REMINDER');
                          }}
                          mode="time"
                          value={morningReminderDate}
                        />
                      }
                    />

                    <ListBox
                      style={tw`mb-3`}
                      paddingSides={true}
                      border={true}
                      textChild={<LeftTextChild text="Evening reminder" />}
                      rightChild={
                        <DateTimePicker
                          onChange={(event, date) => {
                            if (!date) return;
                            setDate(event, date, 'EVENING_REMINDER');
                          }}
                          mode="time"
                          value={eveningReminderDate}
                        />
                      }
                    />
                  </View>
                   */}
                </Disabled>
              </>
            )}
            {/* LOADING AND ERROR */}
            {loading && (
              <FadeInFadeOut watchValue={loading}>
                <View
                  style={tw`flex flex-row items-center justify-center h-100`}>
                  <ActivityIndicator />
                </View>
              </FadeInFadeOut>
            )}
            {error && (
              <FadeInFadeOut watchValue={error}>
                <Error />
              </FadeInFadeOut>
            )}
          </>
        )}
      </AppBodyLayout>
    </MainAppLayout>
  );
};

export default NotificationsScreen;
