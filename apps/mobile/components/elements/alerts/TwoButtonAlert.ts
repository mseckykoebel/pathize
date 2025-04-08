import {Alert} from 'react-native';

type Props = {
  alertTitle: string;
  alertMessage: string;
  buttonOneText: string;
  buttonOneStyle?: 'default' | 'cancel' | 'destructive' | undefined;
  buttonOneOnPress: () => void;
  buttonTwoText: string;
  buttonTwoStyle?: 'default' | 'cancel' | 'destructive' | undefined;
  buttonTwoOnPress: () => void;
};

export function twoButtonAlert({
  alertTitle,
  alertMessage,
  buttonOneText,
  buttonOneStyle = undefined,
  buttonOneOnPress,
  buttonTwoText,
  buttonTwoStyle = undefined,
  buttonTwoOnPress,
}: Props) {
  Alert.alert(alertTitle, alertMessage, [
    {text: buttonOneText, onPress: buttonOneOnPress, style: buttonOneStyle},
    {text: buttonTwoText, onPress: buttonTwoOnPress, style: buttonTwoStyle},
  ]);
}
