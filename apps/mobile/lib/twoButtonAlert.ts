import {Alert} from 'react-native';
import PostHog from 'posthog-react-native';

export function twoButtonAlert(
  title: string,
  message: string,
  cancelText: string,
  confirmText: string,
  onPress?: () => void,
  posthog?: PostHog,
) {
  Alert.alert(
    title,
    message,
    [
      {
        text: cancelText,
        onPress: () => posthog?.capture('Button Cancelled'),
        style: 'cancel',
      },
      {text: confirmText, onPress: onPress},
    ],
    {cancelable: false},
  );
}
