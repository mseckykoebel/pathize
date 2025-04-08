import React from 'react';
import {
  StyleProp,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import {trigger} from 'react-native-haptic-feedback';
import tw from 'twrnc';

type Props = {
  onPress: () => void;
  text: string;
  disabled?: boolean;
  opacity?: number;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export const DarkButton: React.FC<Props> = ({
  onPress,
  text,
  disabled = false,
  opacity = 100,
  style = {},
  textStyle = {},
}): JSX.Element => {
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={() => {
        trigger('impactLight');
        onPress();
      }}
      style={[
        tw`flex w-full justify-center rounded-md border border-transparent py-2 px-4 bg-emerald-600 opacity-${opacity}`,
        style,
      ]}>
      <Text style={[tw`text-sm font-medium text-white text-center`, textStyle]}>
        {text}
      </Text>
    </TouchableOpacity>
  );
};
