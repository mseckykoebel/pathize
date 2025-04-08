/* eslint-disable react/no-unstable-nested-components */
import React, {
  useEffect,
  useReducer,
  useMemo,
  createContext,
  useContext,
  Dispatch,
} from 'react';

// Navigation and lib imports
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNBootSplash from 'react-native-bootsplash';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {
  CustomerIO,
  CustomerIOEnv,
  CustomerioConfig,
} from 'customerio-reactnative';

// Tracking
import {PostHogProvider, usePostHog} from 'posthog-react-native';

// Screens
import LoginScreen from './screens/login/LoginScreen';
import RegisterScreen from './screens/register/RegisterScreen';
import GetStartedScreen from './screens/getStarted/GetStartedScreen';
import NameScreen from './screens/name/NameScreen';
import AgreementsScreen from './screens/agreements/AgreementsScreen';
import NiceToMeetYouScreen from './screens/niceToMeetYou/NiceToMeetYou';
import IntakeScreen from './screens/intake/IntakeScreen';
import IntakeDateSelectScreen from './screens/intakeDateSelect/IntakeScreenDateSelect';

// Lib
import {
  HeaderBack,
  HeaderLogotype,
  HeaderProgressBar,
  HeaderTitle,
} from './components/layouts';
import {
  CheckInComplete,
  ClinicalSurvey,
  OnboardingInformation,
  UserMedication,
  UserSymptom,
} from '@pathize/db';
import {useAppState} from './hooks';
import {getErrorMessage} from './utils';
import {refreshAccessToken} from './lib';
import {isAccessTokenExpired} from './lib/credentials';
import linking from './linking/linking';

// API routes
import {DispatchPayload} from './services';
import {CUSTOMER_IO_CONFIG, config} from './config';
import ResetPasswordScreen from './screens/resetPassword/ResetPassword';
import {
  ContextProviderIsRegistered,
  ContextProviderNotRegistered,
} from './contexts/ContextProvider';
import CrashNavigator from './screens/crashes/CrashNavigator';
import SymptomsNavigator from './screens/symptoms/SymptomNavigator';
import MedicationsNavigator from './screens/medications/MedicationsNavigator';
import {HomeTabs, TestAppleWatch} from './screens';
import ActivitiesNavigator from './screens/activities/ActivityNavigator';
import CheckInNavigator from './screens/checkIns/CheckInsNavigator';
import LoadingScreen from './screens/loading/LoadingScreen';
import HowItWorksScreen from './screens/howItWorks/HowItWorks';
import HealthAssessment from './screens/healthAssessment/HealthAssessment';
import PaymentsScreen from './screens/payments/PaymentScreen';
import WereOnTheAppStore from './screens/wereOnTheAppStore/WereOnTheAppStore';

// START OF NEW THINGS
import type {HeartRateDataSample} from 'terra-api/lib/cjs/models/samples/HeartRateDataSample';
import {PacingDetailsStatsListProps} from './features/pacingDetails/types';
import {PacingDetails} from './screens/home/PacingDetailsScreen';
import {
  PathizeDataMap,
  PathizeExertionGuidance,
  PathizeMetadata,
} from './contexts';
import {
  EnergyBudgetHelpSheet,
  EnergyBudgetMoreDetailsSheet,
} from './features/energyBudget';
import RecordCheckIn from './screens/checkIns/RecordCheckIn';

// NAVIGATION SPECIFIC THINGS

export type BaselineAssessmentStatus = 'next' | 'completed' | 'not-started';

/**
 * ONBOARDING STACK PROPS
 */
export type OnboardingAndPaymentsStackScreenParamList = {
  Login: undefined;
  ResetPassword: undefined;
  GetStarted: undefined;
  Agreements: undefined;
  Name: {
    user: Pick<
      OnboardingInformation,
      'emailNotifications' | 'termsAndConditions'
    >;
  };
  NiceToMeetYou: {
    user: Pick<
      OnboardingInformation,
      | 'emailNotifications'
      | 'termsAndConditions'
      | 'firstName'
      | 'dateOfBirth'
      | 'phoneNumber'
    >;
  };
  Intake: {
    user: Pick<
      OnboardingInformation,
      | 'emailNotifications'
      | 'termsAndConditions'
      | 'firstName'
      | 'dateOfBirth'
      | 'phoneNumber'
    >;
  };
  IntakeDateSelect: {
    user: Pick<
      OnboardingInformation,
      | 'emailNotifications'
      | 'termsAndConditions'
      | 'firstName'
      | 'dateOfBirth'
      | 'phoneNumber'
      | 'illness'
    >;
  };
  Register: {
    user: OnboardingInformation;
  };
  ////
  // AREA FOR AUTHENTICATED CONFIG/SETUP
  ////
  HowItWorks: {
    healthAssessment: ClinicalSurvey | undefined;
  };
  // HEALTH ASSESSMENT SCREEN
  HealthAssessment: {
    healthAssessment: ClinicalSurvey | undefined;
  };
  // PAYMENT SCREEN - NEW PAYMENT/PAYMENT EXPIRED MANAGER
  Payments: undefined;
  // LOADING
  Loading: {
    message: string | undefined;
  };
};

/**
 * HOME PROPS
 */
export type HomeStackScreenParamList = {
  Home: undefined;
  WereOnTheAppStore: undefined;
  RecordCheckIn: {
    checkIn: CheckInComplete;
    medications: UserMedication[];
    symptoms: UserSymptom[];
  };
  PacingDetails: {
    dataArray: PacingDetailsStatsListProps[];
    limit: number;
    maxHr: number;
    minHr: number;
    lastUpdated: string | null;
    processedSamples: HeartRateDataSample[] | null;
    currentSelectedDay?: string;
  };
  Crashes: undefined;
  Symptoms: undefined;
  Medications: undefined;
  Activities: undefined;
  CheckIns: undefined;
  TestAppleWatch: undefined;
  ExertionGuidanceHelp: undefined;
  ExertionGuidanceMoreDetails: {
    data: PathizeDataMap | undefined;
    exertionGuidanceData: PathizeExertionGuidance | undefined;
    metadata: PathizeMetadata | undefined;
  };
};

const OnboardingAndPaymentsStack =
  createStackNavigator<OnboardingAndPaymentsStackScreenParamList>();
const HomeStack = createStackNavigator<HomeStackScreenParamList>();

////
// STATE ACTIONS
////

type State = {
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  isRegistered: boolean;
  subscriptionStatus: 'not subscribed' | 'subscribed' | 'expired';
};

type Action = {
  type: DispatchPayload['type'];
  accessToken?: string;
  refreshToken?: string;
  userId?: string;
  isRegistered?: boolean;
  subscriptionStatus?: 'not subscribed' | 'subscribed' | 'expired';
};

const initialState: State = {
  accessToken: null,
  refreshToken: null,
  userId: null,
  isRegistered: false,
  subscriptionStatus: 'not subscribed',
};

////
// AUTH CONTEXT SIGNED IN OR OUT
////

export type AuthContextNotRegisteredProps = {
  userId: null;
  accessToken: null;
  state: State;
  dispatch: Dispatch<DispatchPayload>;
};

export type AuthContextRegisteredProps = {
  userId: string;
  accessToken: string;
  state: State;
  dispatch: Dispatch<DispatchPayload>;
};

export const AuthContextNotRegistered = createContext<
  AuthContextNotRegisteredProps | undefined
>(undefined);

export const AuthContextRegistered = createContext<
  AuthContextRegisteredProps | undefined
>(undefined);

// USE AUTH FOR SIGNED IN
export const useAuth = () => {
  const context = useContext(AuthContextRegistered);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};

/**
 * @description - for use when the user is signed out/not registered
 */
export const useAuthSignedOut = () => {
  const context = useContext(AuthContextNotRegistered);
  if (context === undefined) {
    throw new Error('useAuthSignedOut must be used within AuthProvider');
  }

  return context;
};

const reducer = (prevState: State, action: Action): State => {
  switch (action.type) {
    case 'REFRESH_ACCESS_TOKEN':
      return {
        ...prevState,
        accessToken: action.accessToken ?? prevState.accessToken,
      };
    case 'REGISTERED_NO_SUBSCRIPTION':
      return {
        ...prevState,
        isRegistered: true,
        subscriptionStatus: 'not subscribed',
        userId: action.userId ?? prevState.userId,
        accessToken: action.accessToken ?? prevState.accessToken,
        refreshToken: action.refreshToken ?? prevState.refreshToken,
      };
    case 'REGISTERED_RENEWING_SUBSCRIPTION':
      return {
        ...prevState,
        isRegistered: true,
        subscriptionStatus: 'expired',
        userId: action.userId ?? prevState.userId,
        accessToken: action.accessToken ?? prevState.accessToken,
        refreshToken: action.refreshToken ?? prevState.refreshToken,
      };
    case 'REGISTERED_WITH_SUBSCRIPTION':
      return {
        ...prevState,
        isRegistered: true,
        subscriptionStatus: 'subscribed',
        userId: action.userId ?? prevState.userId,
        accessToken: action.accessToken ?? prevState.accessToken,
        refreshToken: action.refreshToken ?? prevState.refreshToken,
      };
    case 'SIGNED_OUT':
      return {
        ...prevState,
        isRegistered: false,
        subscriptionStatus: 'not subscribed',
        userId: null,
        accessToken: null,
        refreshToken: null,
      };
    default:
      return prevState;
  }
};

const CoreNav: React.FC = () => {
  const {appStateVisible} = useAppState();
  const posthog = usePostHog();
  const [state, dispatch] = useReducer(reducer, initialState);

  /**
   * AUTH CONTEXT - HANDLE BOTH SIGNED IN AND SIGNED OUT
   */
  const authContext = useMemo(
    () => ({
      userId: state.userId,
      accessToken: state.accessToken,
      state,
      dispatch,
    }),
    [state],
  );

  // Logic that re-sets posthog session id on app load - new visit to the app when app is opened from being backgrounded
  useEffect(() => {
    // reset session ID if the app is active and the userId is present
    if (appStateVisible === 'active' && state.userId) {
      posthog?.resetSessionId();
      posthog?.identify(state.userId);
    }
  }, [appStateVisible, posthog, state]);

  // Very important initialization effect
  useEffect(() => {
    const env = new CustomerIOEnv();
    const data = new CustomerioConfig();

    // set env adn data props
    env.siteId = CUSTOMER_IO_CONFIG.siteId;
    env.apiKey = CUSTOMER_IO_CONFIG.apiKey;
    data.autoTrackDeviceAttributes = true;
    data.enableInApp = true;

    // initialize customerIO
    CustomerIO.initialize(env, data);

    let refreshToken: string | undefined;

    const hideSplash = () => RNBootSplash.hide({fade: true});
    const signOut = async () => {
      await AsyncStorage.getAllKeys().then(keys =>
        AsyncStorage.multiRemove(keys),
      );
      dispatch({type: 'SIGNED_OUT'});
      hideSplash();
    };

    const initAppSession = async () => {
      try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        const userId = await AsyncStorage.getItem('userId');

        if (!accessToken || !userId) {
          return signOut();
        }

        // check if expired and refresh if so
        if (isAccessTokenExpired(accessToken)) {
          // attempt to refresh the token
          try {
            const refreshAccessTokenResult: false | string =
              await refreshAccessToken(userId as string);
            if (!refreshAccessTokenResult) {
              return signOut();
            } else {
              refreshToken = refreshAccessTokenResult;
              initAppSession();
            }
          } catch (e) {
            return signOut();
          }
        }

        dispatch({
          type: 'REGISTERED_WITH_SUBSCRIPTION',
          userId: userId,
          accessToken: accessToken,
          refreshToken: refreshToken,
        });

        return hideSplash();
      } catch (e) {
        console.log('ERROR: ', e);
        hideSplash();
        throw new Error(getErrorMessage(e));
      }
    };

    initAppSession();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer linking={linking}>
        <PostHogProvider
          apiKey={
            config.api.environment === 'production'
              ? 'phc_6OFHL0jHPlRUviWDZGTqwVUmxgbtupJoDg3Gfjl3sfT'
              : 'phc_Ba1B2mxC9eOXhzZUdHGs5XziEyyHZ6NWfE2BDrmE5Gb'
          }
          autocapture={{
            captureTouches: false,
          }}>
          {/* IG USER IS SUBSCRIBED AND REGISTERED, SHOW THE HOME STACK */}
          {state.isRegistered && state.subscriptionStatus === 'subscribed' ? (
            <ContextProviderIsRegistered
              authContext={authContext as AuthContextRegisteredProps}>
              <HomeStack.Navigator
                initialRouteName={'Home'}
                screenOptions={{headerShown: false}}>
                {/* SHOW HOME SCREEN BY DEFAULT */}
                <HomeStack.Group>
                  <HomeStack.Screen name="Home" component={HomeTabs} />
                  <HomeStack.Screen
                    name="RecordCheckIn"
                    component={RecordCheckIn}
                    options={{presentation: 'modal', gestureEnabled: true}}
                  />
                  <HomeStack.Screen
                    name="PacingDetails"
                    component={PacingDetails}
                    options={{presentation: 'modal', gestureEnabled: true}}
                  />
                  <HomeStack.Screen
                    name="WereOnTheAppStore"
                    component={WereOnTheAppStore}
                    options={{presentation: 'modal', gestureEnabled: true}}
                  />
                </HomeStack.Group>
                {/* CRASH GROUP */}
                <HomeStack.Group
                  screenOptions={{
                    presentation: 'modal',
                    gestureEnabled: true,
                  }}>
                  <HomeStack.Screen name="Crashes" component={CrashNavigator} />
                </HomeStack.Group>
                {/* SYMPTOMS GROUP */}
                <HomeStack.Group
                  screenOptions={{
                    presentation: 'modal',
                    gestureEnabled: true,
                  }}>
                  <HomeStack.Screen
                    name="Symptoms"
                    component={SymptomsNavigator}
                  />
                </HomeStack.Group>
                {/* MEDICATIONS GROUP */}
                <HomeStack.Group
                  screenOptions={{
                    presentation: 'modal',
                    gestureEnabled: true,
                  }}>
                  <HomeStack.Screen
                    name="Medications"
                    component={MedicationsNavigator}
                  />
                </HomeStack.Group>
                {/* ACTIVITIES GROUP */}
                <HomeStack.Group
                  screenOptions={{
                    presentation: 'modal',
                    gestureEnabled: true,
                  }}>
                  <HomeStack.Screen
                    name="Activities"
                    component={ActivitiesNavigator}
                  />
                </HomeStack.Group>
                {/* CHECK-INS GROUP */}
                <HomeStack.Group
                  screenOptions={{
                    presentation: 'modal',
                    gestureEnabled: true,
                  }}>
                  <HomeStack.Screen
                    name="CheckIns"
                    component={CheckInNavigator}
                  />
                </HomeStack.Group>
                {/* TEST APPLE WATCH GROUP */}
                <HomeStack.Group
                  screenOptions={{
                    presentation: 'modal',
                    gestureEnabled: true,
                  }}>
                  <HomeStack.Screen
                    name="TestAppleWatch"
                    component={TestAppleWatch}
                  />
                </HomeStack.Group>
                {/* EXERTION GUIDANCE GROUP */}
                <HomeStack.Group
                  screenOptions={{
                    presentation: 'modal',
                    gestureEnabled: true,
                  }}>
                  <HomeStack.Screen
                    name="ExertionGuidanceHelp"
                    component={EnergyBudgetHelpSheet}
                  />
                  <HomeStack.Screen
                    name="ExertionGuidanceMoreDetails"
                    component={EnergyBudgetMoreDetailsSheet}
                  />
                </HomeStack.Group>
              </HomeStack.Navigator>
            </ContextProviderIsRegistered>
          ) : (
            <>
              {!state.isRegistered ? (
                <ContextProviderNotRegistered
                  authContext={authContext as AuthContextNotRegisteredProps}>
                  <OnboardingAndPaymentsStack.Navigator
                    initialRouteName="GetStarted"
                    screenOptions={{
                      headerShown: true,
                    }}>
                    {/* GET STARTED */}
                    <OnboardingAndPaymentsStack.Screen
                      name="GetStarted"
                      component={GetStartedScreen}
                      options={{
                        headerShown: false,
                      }}
                    />
                    {/* LOGIN */}
                    <OnboardingAndPaymentsStack.Screen
                      name="Login"
                      component={LoginScreen}
                      options={{
                        headerLeft: () => <HeaderBack />,
                        headerTitle: () => <HeaderTitle screenName="Log in" />,
                      }}
                    />
                    {/* RESET PASSWORD */}
                    <OnboardingAndPaymentsStack.Screen
                      name="ResetPassword"
                      component={ResetPasswordScreen}
                      options={{
                        headerLeft: () => <HeaderBack />,
                        headerTitle: () => (
                          <HeaderTitle screenName="Reset your password" />
                        ),
                      }}
                    />
                    {/* //// */}
                    {/* ONBOARDING STARTS */}
                    {/* //// */}
                    <OnboardingAndPaymentsStack.Screen
                      name="Agreements"
                      component={AgreementsScreen}
                      options={{
                        headerLeft: () => <HeaderBack />,
                        headerTitle: () => (
                          <HeaderProgressBar progressWidth={'1/6'} />
                        ),
                      }}
                    />
                    {/* NAME AND DATE OF BIRTH DONE HERE */}
                    <OnboardingAndPaymentsStack.Screen
                      name="Name"
                      component={NameScreen}
                      options={{
                        headerLeft: () => <HeaderBack />,
                        headerTitle: () => (
                          <HeaderProgressBar progressWidth={'2/6'} />
                        ),
                      }}
                    />
                    {/* NICE TO MEET YOU -> ASKING ILLNESS QUESTIONS */}
                    <OnboardingAndPaymentsStack.Screen
                      name="NiceToMeetYou"
                      component={NiceToMeetYouScreen}
                      options={{
                        headerLeft: () => <HeaderBack />,
                        headerTitle: () => <HeaderTitle screenName="" />,
                      }}
                    />
                    {/* CHECKING OFF OF ILLNESSES */}
                    <OnboardingAndPaymentsStack.Screen
                      name="Intake"
                      component={IntakeScreen}
                      options={{
                        headerLeft: () => <HeaderBack />,
                        headerTitle: () => (
                          <HeaderTitle screenName="Intake Questionnaire" />
                        ),
                      }}
                    />
                    {/* SELECT DATE OF ILLNESSES (ONE BY ONE IF MORE THAN ONE SELECTED) */}
                    <OnboardingAndPaymentsStack.Screen
                      name="IntakeDateSelect"
                      component={IntakeDateSelectScreen}
                      options={{
                        headerLeft: () => <HeaderBack />,
                        headerTitle: () => (
                          <HeaderTitle screenName="Intake Questionnaire" />
                        ),
                      }}
                    />
                    {/* REGISTER FOR ACCOUNT AND GET JWT */}
                    <OnboardingAndPaymentsStack.Screen
                      name="Register"
                      component={RegisterScreen}
                      options={{
                        headerLeft: () => <HeaderBack />,
                        headerTitle: () => (
                          <HeaderProgressBar progressWidth={'5/6'} />
                        ),
                      }}
                    />
                  </OnboardingAndPaymentsStack.Navigator>
                </ContextProviderNotRegistered>
              ) : (
                <ContextProviderIsRegistered
                  authContext={authContext as AuthContextRegisteredProps}>
                  <OnboardingAndPaymentsStack.Navigator
                    initialRouteName={
                      state.subscriptionStatus === 'expired'
                        ? 'Payments'
                        : 'Loading'
                    }
                    screenOptions={{
                      headerShown: true,
                    }}>
                    {/* //// */}
                    {/* ONBOARDING DONE, NOW FOR FURTHER SETUP */}
                    {/* //// */}
                    {/* HOW IT WORKS -> ASSESSMENT, WEARABLE, BASELINE */}
                    <OnboardingAndPaymentsStack.Screen
                      name="HowItWorks"
                      component={HowItWorksScreen}
                      options={{
                        headerShown: true,
                        title: '',
                        headerBackground: () => <HeaderLogotype />,
                        headerLeft: () => null,
                      }}
                    />
                    {/* HEALTH ASSESSMENT */}
                    <OnboardingAndPaymentsStack.Screen
                      name="HealthAssessment"
                      component={HealthAssessment}
                      options={{
                        headerLeft: () => <HeaderBack />,
                        headerTitle: () => (
                          <HeaderTitle screenName="Health Assessment" />
                        ),
                      }}
                    />
                    {/* LOADING SCREEN */}
                    <OnboardingAndPaymentsStack.Screen
                      name="Loading"
                      component={LoadingScreen}
                      options={{
                        headerShown: false,
                      }}
                    />
                    {/* PAYMENTS */}
                    <OnboardingAndPaymentsStack.Screen
                      name="Payments"
                      component={PaymentsScreen}
                      options={{
                        headerTitle: () => null,
                        headerLeft: () => null,
                        headerStyle: {
                          backgroundColor: '#dbeafe', // blue-100
                        },
                      }}
                    />
                  </OnboardingAndPaymentsStack.Navigator>
                </ContextProviderIsRegistered>
              )}
            </>
          )}
        </PostHogProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default CoreNav;
