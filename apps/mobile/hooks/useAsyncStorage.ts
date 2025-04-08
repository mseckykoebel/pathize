import {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAsyncStorage = <T>(
  key: string,
  initialValue: T,
): [T, (value: T) => Promise<void>, () => Promise<void>] => {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  /**
   * @description get the initial value from async storage and set it
   */
  useEffect(() => {
    const getStoredValue = async () => {
      try {
        const item = await AsyncStorage.getItem(key);
        const value = item ? JSON.parse(item) : initialValue;
        setStoredValue(value);
      } catch (error) {
        console.log(error);
      }
    };

    getStoredValue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * @description set the value in async storage
   */
  const setValue = async (value: T) => {
    try {
      const valueToStore =
        value instanceof Function ? await value(storedValue) : value;

      setStoredValue(valueToStore);

      await AsyncStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * @description reset the value in async storage to the initial value
   */
  const resetValue = async () => {
    try {
      setStoredValue(initialValue);
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue, resetValue];
};
