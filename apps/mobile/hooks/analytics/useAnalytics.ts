import {useCallback} from 'react';
import {usePostHog} from 'posthog-react-native';

import {ProfileScreenParamList} from '../../screens/profile/ProfileScreenNavigator';
import {CrashNavigatorParamList} from '../../screens/crashes/CrashNavigator';
import {TabbedNavigatorParamList} from '../../screens/home/HomeNavigator';
import {SymptomNavigatorParamList} from '../../screens/symptoms/SymptomNavigator';
import {ActivityNavigatorParamList} from '../../screens/activities/ActivityNavigator';
import {MedicationNavigatorParamList} from '../../screens/medications/MedicationsNavigator';
import {
  HomeStackScreenParamList,
  OnboardingAndPaymentsStackScreenParamList,
} from '../../CoreNav';
import {CheckInNavigatorParamList} from '../../screens/checkIns/CheckInsNavigator';

export type UserRecordEvent =
  | 'User Medication'
  | 'User Symptom'
  | 'User Activity'
  | 'Crash/PEM'
  | 'Symptom Record'
  | 'Activity Record'
  | 'Medication Record'
  | 'Check In';

export type RecordEvent = 'Medication' | 'Crash/PEM' | 'Symptom' | 'Activity';

export type UserOperation = 'Created' | 'Updated' | 'Deleted' | 'Started';

export type InterfaceOperation =
  | 'Opened'
  | 'Closed'
  | 'Pressed'
  | 'Toggled' // use for boolean/'on' or 'off' values
  | 'Swiped'
  | 'Loaded'
  | 'Focused'
  | 'Cancelled'
  | 'Selected'
  | 'Logged out'
  | 'Logged in'
  | 'Registered'
  | 'Clicked'
  | 'Completed'
  | 'Started'
  | 'Connected'
  | 'Purchased'
  | 'Subscribed to'
  | 'Skipped'
  | 'Set'
  | 'Sent'
  | 'Received';

export type InterfaceElement =
  | 'Chart'
  | 'Link'
  | 'Message'
  | 'Button'
  | 'Switch'
  | 'Slider'
  | 'Picker'
  | 'Tab'
  | 'Item'
  | 'Notification'
  | 'Screen'
  | 'Sheet'
  | 'Icon'
  | 'Device'
  | 'App'
  | 'Connection'
  | 'Input';

type ExtractRouteNames<T> = keyof T;

type ProfileScreenNames = ExtractRouteNames<ProfileScreenParamList>;
type CrashScreenNames = ExtractRouteNames<CrashNavigatorParamList>;
type TabbedScreenNames = ExtractRouteNames<TabbedNavigatorParamList>;
type SymptomScreenNames = ExtractRouteNames<SymptomNavigatorParamList>;
type HomeStackScreenNames = ExtractRouteNames<HomeStackScreenParamList>;
type ActivityScreenNames = ExtractRouteNames<ActivityNavigatorParamList>;
type MedicationScreenNames = ExtractRouteNames<MedicationNavigatorParamList>;
type OnboardingAndPaymentsScreenNames =
  ExtractRouteNames<OnboardingAndPaymentsStackScreenParamList>;
type CheckInScreenNames = ExtractRouteNames<CheckInNavigatorParamList>;

export type AllScreenParams =
  | OnboardingAndPaymentsScreenNames
  | HomeStackScreenNames
  | ProfileScreenNames
  | CrashScreenNames
  | TabbedScreenNames
  | SymptomScreenNames
  | ActivityScreenNames
  | MedicationScreenNames
  | CheckInScreenNames;

export type InteractionEventProps = {
  value?: string | number | boolean | undefined | null;
  $screen_name?: AllScreenParams;
  $set?: Record<string, string | unknown>;
  [key: string]: string | unknown;
};

export type RecordEventProps = {
  $screen_name: AllScreenParams;
  $set?: Record<string, string | unknown>;
  platform?: 'iphone' | 'apple_watch';
  [key: string]: string | unknown;
};

export type InterfaceEventProps = {
  $screen_name: AllScreenParams;
  $set?: Record<string, string | unknown>;
  [key: string]: string | unknown;
};

export const useAnalytics = () => {
  const posthog = usePostHog();

  const interactionEvent = useCallback(
    (
      element: InterfaceElement,
      operation: InterfaceOperation,
      props: InteractionEventProps,
    ) => {
      posthog?.capture(`${element} ${operation}`, {
        ...props,
      });
    },
    [posthog],
  );

  const recordEvent = useCallback(
    (
      event: UserRecordEvent | RecordEvent,
      operation: UserOperation,
      props?: RecordEventProps,
    ) => {
      posthog?.capture(`${event} ${operation}`, {
        ...props,
      });
    },
    [posthog],
  );

  const interfaceEvent = useCallback(
    (operation: InterfaceOperation, props: InterfaceEventProps) => {
      posthog?.capture(`${operation}`, {
        ...props,
      });
    },
    [posthog],
  );

  const identify = useCallback(
    (userId: string) => {
      posthog?.identify(userId);
    },
    [posthog],
  );

  const featureFlag = useCallback(
    (featureFlagId: string) => {
      const flag = posthog?.getFeatureFlag(featureFlagId);
      return flag;
    },
    [posthog],
  );

  return {
    interactionEvent,
    recordEvent,
    interfaceEvent,
    identify,
    featureFlag,
  };
};
