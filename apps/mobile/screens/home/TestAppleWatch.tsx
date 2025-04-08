import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {usePostHog} from 'posthog-react-native';
import tw from 'twrnc';

import {AWCManager} from 'awc-manager';
import {AppBodyLayout} from '../../components/layouts';
import {DarkButton} from '../../components/elements';
import {SheetNavbar} from '../../components/sheets/SheetNavbar';
import {HomeStackScreenParamList, useAuth} from '../../CoreNav';
import {
  useActivitiesContext,
  useAppleWatchContext,
  useLimitContext,
  usePathizeDataContext,
  usePathizeSelectedDayContext,
} from '../../contexts';
import {Body1, Header1, Header2, Subheader} from '@pathize/mobile-ui';
import {getCircular} from '../../utils';
import {getPaywallStatus, oneButtonAlert} from '../../lib';

async function updatePaywallConfig(enable: boolean) {
  try {
    await AsyncStorage.setItem('paywallEnabled', enable ? 'true' : 'false');
    oneButtonAlert(
      'Paywall config updated',
      `Paywall has been ${enable ? 'enabled' : 'disabled'}.`,
    );
  } catch (e) {
    oneButtonAlert(
      'Error',
      'There was an error updating the paywall config. Previous setting still used.',
    );
  }
}

export const TestAppleWatch: React.FC = () => {
  const [showLimit, setShowLimit] = useState<boolean>(true);
  const [isPaywallEnabled, setIsPaywallEnabled] = useState<boolean | null>(
    null,
  );
  const [isInstalled, setIsInstalled] = useState<boolean | null>(null);
  const [isPaired, setIsPaired] = useState<boolean | null>(null);
  const [isReachable, setIsReachable] = useState<boolean | null>(null);
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const {isAWFullyAvailable, sendMessage, sendContextToAppleWatch} =
    useAppleWatchContext();

  const {userId, accessToken} = useAuth();
  const {limit} = useLimitContext();
  const {userActivities, getUserActivities} = useActivitiesContext();
  const {
    state: {
      loading: exertionGuidanceLoading,
      energyBudgetData: exertionGuidanceData,
    },
  } = usePathizeDataContext();
  const {
    state: {metadata},
  } = usePathizeSelectedDayContext();
  const posthog = usePostHog();
  const homeNavigation =
    useNavigation<
      StackNavigationProp<HomeStackScreenParamList, 'TestAppleWatch'>
    >();

  const testAppleWatchConnection = async () => {
    try {
      const isWCInstalled = await AWCManager?.isWatchAppInstalled();
      const isWCPaired = await AWCManager?.isPaired();
      const isWCReachable = await AWCManager?.isReachable();
      const isWCSupported = await AWCManager?.isWCSupported();

      // set status variables
      setIsInstalled(Boolean(isWCInstalled));
      setIsPaired(Boolean(isWCPaired));
      setIsReachable(Boolean(isWCReachable));
      setIsSupported(Boolean(isWCSupported));

      oneButtonAlert('Connection status updated', '');
    } catch (e) {
      oneButtonAlert('Error', 'There was an error testing the connection.');
    }
  };

  const startActivity = async () => {
    if (!(await isAWFullyAvailable())) {
      oneButtonAlert(
        'Apple Watch is not available',
        'Please make sure your Apple Watch is paired and the app is installed on your watch.',
      );
      return;
    }

    if (!userActivities) {
      oneButtonAlert(
        'No activities found',
        'Please make sure you have at least one activity in your account.',
      );
      return;
    }

    try {
      const context = await sendContextToAppleWatch(
        userId,
        accessToken,
        userActivities[Math.floor(Math.random() * userActivities.length)].id,
      );

      if (!context?.includes('Transferred')) {
        oneButtonAlert(
          'Credentials were not transferred successfully',
          'Please try again.',
        );
        return;
      }

      // start the activity
      AWCManager?.startActivity();

      oneButtonAlert(
        'Activity started',
        'The activity has been started on your Apple Watch.',
      );

      // 5 seconds later, re-set the context but without the pendingActivity key
      setTimeout(async () => {
        await sendContextToAppleWatch(userId, accessToken);
      }, 5000);
    } catch (e) {
      console.log('there was an error starting activity: ', e);
    }
  };

  useEffect(() => {
    const setupInitialPaywallValue = async () => {
      setIsPaywallEnabled(await getPaywallStatus());
    };

    setupInitialPaywallValue();
    getUserActivities();
  }, [getUserActivities]);

  return (
    <>
      <SheetNavbar
        onClose={() => homeNavigation.navigate('Home')}
        posthog={posthog}
        screenName="Home"
      />
      <AppBodyLayout
        scrollable={true}
        avoidKeyboard={true}
        padding={false}
        paddingSides={true}
        navigator={homeNavigation}
        swipeToDismiss={true}
        dismissKeyboardOnTouch={true}
        route="Home"
        backgroundColor="bg-white">
        {/* HEADER */}
        <Header1
          padding={false}
          text={'Developer Options'}
          style={[tw`text-slate-900 text-2xl font-bold`, getCircular('Bold')]}
        />
        {/* SUBHEADER */}
        <Subheader
          paddingBottom={true}
          text={
            'Test Apple Watch connection, toggle paywall, and other root options '
          }
          style={[tw``, getCircular('Book')]}
        />
        {/* CONNECTION STATUS */}
        <Header2
          text={'Connection status'}
          paddingTop={false}
          textStyle={[tw`font-semibold text-slate-950`, getCircular('Book')]}
        />
        {/* IS INSTALLED */}
        <Body1
          text={`Is watch app installed: ${
            typeof isInstalled === 'boolean'
              ? isInstalled
                ? 'Yes'
                : 'No'
              : '???'
          }`}
          textStyle={[tw``, getCircular('Book')]}
        />
        {/* IS PAIRED */}
        <Body1
          text={`Is watch paired: ${
            typeof isPaired === 'boolean' ? (isPaired ? 'Yes' : 'No') : '???'
          }`}
          textStyle={[tw``, getCircular('Book')]}
        />
        {/* IS REACHABLE */}
        <Body1
          text={`Is watch reachable: ${
            typeof isReachable === 'boolean'
              ? isReachable
                ? 'Yes'
                : 'No'
              : '???'
          }`}
          textStyle={[tw``, getCircular('Book')]}
        />
        {/* IS SUPPORTED */}
        <Body1
          text={`Is watch supported: ${
            typeof isSupported === 'boolean'
              ? isSupported
                ? 'Yes'
                : 'No'
              : '???'
          }`}
          textStyle={[tw``, getCircular('Book')]}
        />

        {/* PAYWALL STATUS */}
        <Header2
          text={'Paywall status'}
          paddingTop={true}
          textStyle={[tw`font-semibold text-slate-950`, getCircular('Book')]}
        />
        {/* IS PAYWALL ENABLED */}
        <Body1
          text={`Is paywall enabled: ${
            typeof isPaywallEnabled === 'boolean'
              ? isPaywallEnabled
                ? 'Yes'
                : 'No'
              : '???'
          }`}
          textStyle={[tw``, getCircular('Book')]}
        />

        {/* SHOW THE LIMIT */}
        {showLimit && (
          <>
            <Header2
              text={'Limit'}
              paddingTop={true}
              textStyle={[
                tw`font-semibold text-slate-950`,
                getCircular('Book'),
              ]}
            />
            <Body1
              text={`Limit: ${limit}`}
              textStyle={[tw``, getCircular('Book')]}
            />
          </>
        )}
        {/* LIST THE USER ACTIVITIES */}
        {userActivities && (
          <>
            <Header2
              text={'User activities'}
              paddingTop={true}
              textStyle={[
                tw`font-semibold text-slate-950`,
                getCircular('Book'),
              ]}
            />
            <View style={tw`flex items-start justify-between`}>
              <View style={tw`text-sm`}>
                {userActivities && userActivities.length > 0 ? (
                  userActivities.map((activity, index) => (
                    <Body1
                      key={index}
                      text={`· ${activity.activityName}`}
                      textStyle={[tw``, getCircular('Book')]}
                    />
                  ))
                ) : (
                  <Body1
                    text={'No activities found'}
                    textStyle={[tw``, getCircular('Book')]}
                  />
                )}
              </View>
            </View>
          </>
        )}
        {/* ENERGY BUDGET DETAILS */}
        <Header2
          text={'Energy budget details'}
          paddingTop={true}
          textStyle={[tw`font-semibold text-slate-950`, getCircular('Book')]}
        />
        <Body1
          text={`Energy budget loading: ${exertionGuidanceLoading}`}
          textStyle={[tw``, getCircular('Book')]}
        />
        <Body1
          text={`Time above limit current: ${metadata?.timeAboveLimit}`}
          textStyle={[tw``, getCircular('Book')]}
        />
        <Body1
          text={`Energy budget time above limit: ${exertionGuidanceData?.exertionGuidanceTimeAboveLimit}`}
          textStyle={[tw``, getCircular('Book')]}
        />
        {/* BOTTOM BUTTON AREA */}
        <View style={tw`my-10 w-full`}>
          <DarkButton
            style={[tw`bg-yellow-700 mt-4 rounded-lg`]}
            onPress={testAppleWatchConnection}
            text={'Test apple watch connection'}
            textStyle={[tw``, getCircular('Book')]}
          />
          <DarkButton
            style={[tw`bg-gray-700 mt-4 rounded-lg`]}
            onPress={() => {
              setShowLimit(true);
              AWCManager?.sendMessage({limit: String(limit ?? 100)});
              oneButtonAlert(
                'Limit sent',
                `The limit of ${limit} has been sent to the watch.`,
              );
            }}
            text={'Send limit'}
            textStyle={[tw``, getCircular('Book')]}
          />
          <DarkButton
            style={[tw`bg-emerald-700 mt-4 rounded-lg`]}
            onPress={() => {
              setShowLimit(true);
              setTimeout(() => {
                setShowLimit(false);
              }, 5000);

              startActivity();
            }}
            text={'Start random activity on Apple Watch'}
            textStyle={[tw``, getCircular('Book')]}
          />
          <DarkButton
            style={[tw`bg-blue-700 mt-4 rounded-lg`]}
            onPress={() => {
              // send the limit to the watch
              console.log('sent credentials');
              sendContextToAppleWatch(userId, accessToken);
            }}
            text={'Send credentials to watch'}
            textStyle={[tw``, getCircular('Book')]}
          />
          <DarkButton
            style={tw`bg-red-700 mt-4 rounded-lg`}
            onPress={() => {
              sendMessage({activities: 'activities'});
              oneButtonAlert(
                'Activities sent',
                `Activities sent to watch: ${
                  userActivities
                    ? userActivities
                        .map(activity => activity.activityName)
                        .join(', ')
                    : 'None'
                }`,
              );
            }}
            text={'Send activities list to watch'}
            textStyle={[tw``, getCircular('Book')]}
          />
          {/* PAYWALL CONFIG */}
          <DarkButton
            style={tw`bg-slate-950 mt-4 rounded-lg`}
            onPress={() => {
              // TODO: does not ignore errors but TBH i dont think this will fail lmao
              updatePaywallConfig(true);
              setIsPaywallEnabled(true);
            }}
            text={'Enable paywall'}
            textStyle={[tw``, getCircular('Book')]}
          />
          <DarkButton
            style={tw`bg-orange-600 mt-4 rounded-lg`}
            onPress={() => {
              // TODO: same as above
              updatePaywallConfig(false);
              setIsPaywallEnabled(false);
            }}
            text={'Disable paywall'}
            textStyle={[tw``, getCircular('Book')]}
          />
        </View>
      </AppBodyLayout>
    </>
  );
};
