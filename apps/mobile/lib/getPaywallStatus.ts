import {Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getPaywallStatus() {
  try {
    const paywallEnabled = await AsyncStorage.getItem('paywallEnabled');
    return paywallEnabled === 'true';
  } catch (e) {
    Alert.alert(
      'Error getting paywall config',
      'There was an error getting the paywall config. Defaulting to true.',
    );
    return true;
  }
}
