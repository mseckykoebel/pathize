import {useState, useEffect} from 'react';
import {Alert} from 'react-native';

/**
 *
 * @param errorMessage message to be displayed if there is an error
 * @param loading current state of async operation
 * @param onComplete function to run if async operation completes successfully
 */
export const useHandleLoadingError = (
  errorMessage: string | null,
  loading: boolean,
  onComplete: () => void,
) => {
  useEffect(() => {
    if (errorMessage) {
      Alert.alert('There was an issue', errorMessage);
    }
  }, [errorMessage]);

  const [prevLoading, setPrevLoading] = useState(false);
  useEffect(() => {
    if (prevLoading && !loading && errorMessage === null) {
      onComplete();
    }

    // reset prior loading, useEffect above will render error if there was an error
    if (errorMessage) {
      setPrevLoading(false);
    }
    setPrevLoading(loading);
  }, [loading, errorMessage, onComplete, prevLoading]);
};
