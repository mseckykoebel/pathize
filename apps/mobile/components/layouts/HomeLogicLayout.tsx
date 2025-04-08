import React, {ReactNode, useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import tw from 'twrnc';

import {User} from '@pathize/db';
import {LIFETIME_KEYS, config} from '../../config';
import {getPaywallStatus, oneButtonAlert} from '../../lib';
import {useAuth} from '../../CoreNav';
import {usePurchasesContext, useUserContext} from '../../contexts';
import {
  useAnalytics,
  useAppState,
  useDeepLinks,
  useIsAuthorized,
} from '../../hooks';

type Props = {
  children: ReactNode | ReactNode[];
};

export const HomeLogicLayout: React.FC<Props> = ({children}) => {
  const [initialized, setInitialized] = useState(false);
  const {dispatch} = useAuth();
  const {interfaceEvent} = useAnalytics();
  const {user} = useUserContext();
  const {isAuthorized} = useIsAuthorized();
  const {checkSubscriptionStatus: checkStatus} = usePurchasesContext();
  const {initialDeepLink, handleDeepLink} = useDeepLinks();
  const {appStateVisible} = useAppState();
  const homeNavigation = useNavigation<any>();

  /**
   * @description check for cases where the user has elevated permissions and does not need to pay
   */
  const isPaywallEnabledInDevMode = useCallback(async () => {
    if (config.api.environment !== 'production') {
      const isPaywallEnabled = await getPaywallStatus();
      if (!isPaywallEnabled) {
        return true;
      }
    }

    return false;
  }, []);

  /**
   * @description - checks if the user is authorized (403 check), and if they are an admin
   */
  const checkIfElevated = useCallback(async () => {
    // check if the user has an elevated status
    const isElevated = await isPaywallEnabledInDevMode();
    if (isElevated) {
      interfaceEvent('Set', {
        $screen_name: 'HomeScreen',
        $set: {
          subscriptionStatus: 'Admin',
        },
      });
      return true;
    }

    return false;
  }, [isPaywallEnabledInDevMode, interfaceEvent]);

  /**
   * @description - check if the user has been given lifetime access by the company
   */
  const checkIfAdmin = useCallback(
    async (u: User) => {
      const isLifetime = LIFETIME_KEYS.includes(u.email);
      if (isLifetime) {
        interfaceEvent('Set', {
          $screen_name: 'HomeScreen',
          $set: {
            subscriptionStatus: 'Admin',
          },
        });
        return true;
      }

      return false;
    },
    [interfaceEvent],
  );

  /**
   * @description - check if the user has an active subscription, and respond accordingly
   */
  const checkSubscriptionStatus = useCallback(async () => {
    try {
      const status = await checkStatus();
      console.log('🔍 SUBSCRIPTION STATUS', status);
      // if status successful and user subscribed
      if (status.success === true && status.message === 'Subscribed') {
        interfaceEvent('Set', {
          $screen_name: 'HomeScreen',
          $set: {
            subscriptionStatus: 'Subscribed',
          },
        });
        return;
      }
      // if status successful and not subscribed
      if (status.success === true && status.message === 'NotSubscribed') {
        interfaceEvent('Set', {
          $screen_name: 'HomeScreen',
          $set: {
            subscriptionStatus: 'NotSubscribed',
          },
        });
        dispatch({type: 'REGISTERED_RENEWING_SUBSCRIPTION'});
        homeNavigation.navigate('Payments');
        return;
      }
      interfaceEvent('Set', {
        $screen_name: 'HomeScreen',
        $set: {
          subscriptionStatus: null,
        },
      });

      oneButtonAlert(
        'Issue getting your subscription status',
        'There was an issue getting your current subscription status, either from us, or from Apple. You may be able to use Pathize as normal.',
      );
      return;
    } catch (err) {
      oneButtonAlert(
        'Error getting your subscription status',
        'There was an issue getting your current subscription status, either from us, or from Apple. You may be able to use Pathize as normal.',
      );
      return;
    }
  }, [checkStatus, dispatch, homeNavigation, interfaceEvent]);

  /**
   * @description - handle initial deep link, or initialization
   */
  useEffect(() => {
    // set home loaded interface
    const init = async () => {
      interfaceEvent('Loaded', {
        $screen_name: 'HomeScreen',
      });
      setInitialized(true);
    };

    // checks elevated status, referred user count, and subscription status
    const checkAuthAndSubscriptionStatus = async () => {
      if (!isAuthorized) {
        dispatch({type: 'SIGNED_OUT'});
        return;
      }

      // only applies for devs
      const isElevated = await checkIfElevated();
      if (isElevated) return;

      // has user been given admin access. return early if there is no user object
      if (!user) return;
      const isAdminUser = await checkIfAdmin(user);
      if (isAdminUser) return;

      // await getReferredUserCountAndCheckPromotion();
      await checkSubscriptionStatus();
    };

    if (appStateVisible === 'active') {
      if (!initialized) init();
      if (initialDeepLink) handleDeepLink(initialDeepLink);

      checkAuthAndSubscriptionStatus();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, appStateVisible]);

  return <View style={tw`flex-1`}>{children}</View>;
};
