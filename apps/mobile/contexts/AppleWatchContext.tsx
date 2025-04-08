import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {NativeEventEmitter, NativeModule} from 'react-native';

import {AWCManager} from 'awc-manager';
import {useAuth} from '../CoreNav';
import {useAnalytics, useAppState} from '../hooks';
import {useActivitiesContext} from './ActivitiesContext';

const watchEmitter = new NativeEventEmitter(AWCManager as NativeModule);

export type AppleWatchContext = {
  // SEE IF APP WAS LAUNCHED FROM PHONE
  wasAppLaunched: boolean;
  setWasAppLaunched: Dispatch<SetStateAction<boolean>>;
  // ERROR STATE
  error: boolean;
  setError: Dispatch<SetStateAction<boolean>>;
  // HELPER STATUS'
  checkLoading: boolean;
  setCheckLoading: Dispatch<SetStateAction<boolean>>;
  // WATCH STATUS
  isPaired: boolean;
  setIsPaired: Dispatch<SetStateAction<boolean>>;
  isFullyAvailable: boolean;
  setIsFullyAvailable: Dispatch<SetStateAction<boolean>>;
  isAWRunningActivity: boolean;
  setIsAWRunningActivity: Dispatch<SetStateAction<boolean>>;
  isInstalled: boolean;
  setIsInstalled: Dispatch<SetStateAction<boolean>>;
  // HELPER FUNCTIONS
  isAWFullyAvailable: () => Promise<boolean>;
  sendMessage: (
    message:
      | {
          [key: string]: Record<string, string | unknown> | string;
        }
      | string
      | null,
  ) => void;
  sendContextToAppleWatch: (
    userId: string,
    accessToken: string,
    pendingActivity?: string,
  ) => Promise<string>;
  sendAndStartActivityOnWatch: (
    pendingActivity?: string,
    callback?: () => {},
  ) => Promise<{
    success: boolean;
    message: string;
  }>;
};

const AppleWatchContext = createContext<AppleWatchContext | undefined>(
  undefined,
);

export const useAppleWatchContext = () => {
  const context = useContext(AppleWatchContext);
  if (context === undefined) {
    throw new Error(
      'useAppleWatchContext must be used within a AppleWatchProvider',
    );
  }

  return context;
};

export const AppleWatchProvider = ({children}: {children: ReactNode}) => {
  const {userId, accessToken} = useAuth();
  const {appStateVisible} = useAppState();
  const {recordEvent} = useAnalytics();
  const {getActivityRecords} = useActivitiesContext();

  const [wasAppLaunched, setWasAppLaunched] = useState(false);
  const [error, setError] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);
  const [isPaired, setIsPaired] = useState<boolean>(false);
  const [isFullyAvailable, setIsFullyAvailable] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(true);
  const [isAWRunningActivity, setIsAWRunningActivity] =
    useState<boolean>(false);

  ////
  // HELPER FUNCTIONS
  ////

  /**
   * @description - sends a message to the watch
   */
  const sendMessage = useCallback(
    (
      message:
        | {
            [key: string]: Record<string, string | unknown> | string;
          }
        | string
        | null,
    ) => {
      return AWCManager?.sendMessage(message);
    },
    [],
  );

  /**
   * @description - sends the user's context to the watch
   */
  const sendContextToAppleWatch = useCallback(
    async (
      id: string,
      token: string,
      pendingActivity?: string,
    ): Promise<string> => {
      console.log('Sending context to Apple Watch!');
      return await AWCManager?.sendContextToAppleWatch({
        userId: `${id}`,
        accessToken: `${token}`,
        ...(pendingActivity && {pendingActivity: pendingActivity}),
      });
    },
    [],
  );

  /**
   * @description - checks if the watch is paired
   */
  const isAWPaired = useCallback(async () => {
    try {
      const result = await AWCManager?.isPaired();
      return Boolean(result);
    } catch (err) {
      console.log('Error checking watch pairing:', err);
    }
  }, []);

  /**
   * @description - checks if the watch is installed
   */
  const isAWInstalled = useCallback(async () => {
    try {
      const result = await AWCManager?.isWatchAppInstalled();
      return Boolean(result);
    } catch (err) {
      console.log('Error checking watch installation:', err);
    }
  }, []);

  /**
   * @description - checks if there is a running activity
   */
  const checkIfAWRunningActivity = useCallback(() => {
    return sendMessage({running: 'running'});
  }, [sendMessage]);

  /**
   * @description - checks if the watch is fully available, meaning it is paired, supported, installed, and reachable
   */
  const isAWFullyAvailable = useCallback(async () => {
    const status =
      (await AWCManager?.isPaired()) &&
      (await AWCManager?.isWCSupported()) &&
      (await AWCManager?.isWatchAppInstalled());
    // (await AWCManager?.isReachable()); <- reachable seems to not be needed, as this seems to look for if the app is open
    return Boolean(status);
  }, []);

  /**
   * @description - updates the watch state, and also updates the watch context
   */
  const handleAppStateChange = useCallback(async () => {
    setCheckLoading(true);

    // initialize watch context
    sendMessage({
      credentials: {userId: `${userId}`, accessToken: `${accessToken}`},
    });

    // check status flags
    checkIfAWRunningActivity();
    const availableStatus = await isAWFullyAvailable();
    const pairedStatus = await isAWPaired();
    const installedStatus = await isAWInstalled();

    setIsFullyAvailable(availableStatus ?? false);
    setIsPaired(pairedStatus ?? false);
    setIsInstalled(installedStatus ?? false);
    setCheckLoading(false);
  }, [
    accessToken,
    userId,
    checkIfAWRunningActivity,
    isAWFullyAvailable,
    isAWInstalled,
    isAWPaired,
    sendMessage,
  ]);

  /**
   * @description - checks the watch state every 10 seconds, does not update the watch context lik handleAppStateChange
   * this is useful if we want to get the current state of the watch, but we do not want to accidentally overwrite the watch context
   */
  const handlePeriodicCheck = useCallback(async () => {
    // check if running
    checkIfAWRunningActivity();
    const availableStatus = await isAWFullyAvailable();
    const pairedStatus = await isAWPaired();
    const installedStatus = await isAWInstalled();

    setIsFullyAvailable(availableStatus ?? false);
    setIsPaired(pairedStatus ?? false);
    setIsInstalled(installedStatus ?? false);
  }, [checkIfAWRunningActivity, isAWFullyAvailable, isAWPaired, isAWInstalled]);

  /**
   * @description - send, and then start, an activity on the apple watch
   */
  const sendAndStartActivityOnWatch = useCallback(
    async (pendingActivity?: string, callback?: () => {}) => {
      if (!isFullyAvailable || !userId || !accessToken) {
        return {
          success: false,
          message: 'Watch is not fully available',
        };
      }

      try {
        const sentContext = await sendContextToAppleWatch(
          userId,
          accessToken,
          pendingActivity,
        );
        if (sentContext?.includes('Transferred')) {
          AWCManager?.startActivity();
          recordEvent('Activity', 'Started', {
            $screen_name: 'NewActivityRecordAppleWatch',
            platform: 'apple_watch',
          });
          return {
            success: true,
            message:
              'Successfully sent context and attempted to start activity',
          };
        } else {
          return {
            success: false,
            message: 'Error sending context to watch',
          };
        }
      } catch (e) {
        return {
          success: false,
          message: 'Error sending context to watch',
        };
      } finally {
        callback && callback();
      }
    },
    [
      accessToken,
      userId,
      isFullyAvailable,
      recordEvent,
      sendContextToAppleWatch,
    ],
  );

  const [initialized, setInitialized] = useState(false);

  ////
  // INIT, AND AW LISTENERS
  ////

  useEffect(() => {
    /**
     * @description - watch for any incoming messages from the watch
     */
    const watchSubscription = watchEmitter.addListener(
      'messageReceivedNoReply',
      message => {
        console.log('⌚️ MESSAGE RECEIVED FROM WATCH: ', message);
        if ('activityReceived' in message) {
          setWasAppLaunched(true);
          const resetContext = async () => {
            await sendContextToAppleWatch(userId, accessToken);
          };
          resetContext();
        }
        if ('runningStatus' in message) {
          if (message.runningStatus === '0') {
            setIsAWRunningActivity(false);
          } else {
            setIsAWRunningActivity(true);
          }
        }
        if ('refreshActivities' in message) {
          getActivityRecords();
        }
        if ('Success' in message) {
          setWasAppLaunched(true);
        }
        if ('Error' in message) {
          setWasAppLaunched(false);
          setError(true);
          setTimeout(() => {
            setError(false);
          }, 4000);
        }
        if ('credentialsRequest' in message) {
          if (!userId || !accessToken) return;
          const sendResponse = async () => {
            try {
              // send context, and send as a message
              const response = await sendContextToAppleWatch(
                userId,
                accessToken,
              );
              sendMessage({
                credentials: {
                  userId: `${userId}`,
                  accessToken: `${accessToken}`,
                },
              });

              if (!response.includes('Transferred context successfully')) {
                console.error('Error sending context to watch');
              } else {
                console.log('Successfully sent context to watch');
              }
            } catch (err) {
              console.log('Error sending context to watch: ', err);
            }
          };

          sendResponse();
        }
      },
    );

    /**
     * @description - initialize the initial watch state
     */
    const init = async () => {
      console.log('⌚️ INITIALIZING WATCH STATE/SENDING INITIAL CONTEXT');
      await handleAppStateChange();
      setInitialized(true);
    };

    if (!initialized) {
      init();
    }

    const interval = setInterval(async () => {
      if (appStateVisible === 'active') {
        await handlePeriodicCheck();
      }
    }, 10000);

    return () => {
      watchSubscription.remove();
      clearInterval(interval);
    };
  }, [
    userId,
    accessToken,
    appStateVisible,
    handleAppStateChange,
    getActivityRecords,
    sendContextToAppleWatch,
    handlePeriodicCheck,
    sendMessage,
    initialized,
  ]);

  const value = {
    // WAS LAUNCHED
    wasAppLaunched,
    setWasAppLaunched,
    // ERROR CHECKER
    error,
    setError,
    // APP STATE AND HELPERS
    checkLoading,
    setCheckLoading,
    isPaired,
    setIsPaired,
    isFullyAvailable,
    setIsFullyAvailable,
    isInstalled,
    setIsInstalled,
    // HELPER FUNCTIONS
    isAWFullyAvailable,
    sendMessage,
    sendContextToAppleWatch,
    sendAndStartActivityOnWatch,
    // IS RUNNING ACTIVITY
    isAWRunningActivity,
    setIsAWRunningActivity,
  };

  return (
    <AppleWatchContext.Provider value={value}>
      {children}
    </AppleWatchContext.Provider>
  );
};
