import {Alert} from 'react-native';

export function oneButtonAlert(title: string, message: string) {
  Alert.alert(
    title,
    message,
    [{text: 'OK', onPress: () => console.log('OK Pressed')}],
    {
      cancelable: false,
    },
  );
}
