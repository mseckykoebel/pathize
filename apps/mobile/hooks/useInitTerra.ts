import {useEffect, useState} from 'react';
import {initTerra} from 'terra-react';

import {useAuth} from '../CoreNav';
import {getTerraDevID, oneButtonAlert} from '../lib';

/**
 * @description This hook initializes Terra for any component that needs to use the Terra service
 */
export const useInitTerra = () => {
  const [initStatus, setInitStatus] = useState<boolean>(false);
  const {userId} = useAuth();

  useEffect(() => {
    const initializeTerra = async () => {
      try {
        let initResult;
        do {
          initResult = await initTerra(getTerraDevID(), userId);
          if (
            initResult.success === false &&
            initResult.error === 'No Internet'
          ) {
            console.log(
              'No internet when trying to initialize Terra - retrying initialization...',
            );
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } while (
          initResult.success === false &&
          initResult.error === 'No Internet'
        );
        setInitStatus(initResult.success as boolean);
      } catch (err) {
        console.log('Issue initializing terra: ', err);
        oneButtonAlert(
          'There was an error setting up Pathize',
          'Please close and re-open Pathize to try again.',
        );
      }
    };

    initializeTerra();
  }, [userId]);

  return {initStatus};
};
