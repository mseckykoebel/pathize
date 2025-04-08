import React from 'react';
import {TouchableOpacity, Text, StyleProp, ViewStyle} from 'react-native';
import RNReactNativeHapticFeedback from 'react-native-haptic-feedback';
import tw from 'twrnc';

type Props = {
  onPress: () => void;
  text: string;
  textColor?: string;
  style?: StyleProp<ViewStyle>;
};

export const TextButton: React.FC<Props> = ({
  onPress,
  text,
  textColor = 'text-gray-700',
  style = {},
}): JSX.Element => {
  return (
    <TouchableOpacity
      style={style}
      onPress={() => {
        RNReactNativeHapticFeedback.trigger('impactLight');
        onPress();
      }}>
      <Text style={tw`font-medium ${textColor}`}>{text}</Text>
    </TouchableOpacity>
  );
};
