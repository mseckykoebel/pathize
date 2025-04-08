import React from 'react';
import {StyleProp, Text, TouchableOpacity, ViewStyle} from 'react-native';
import RNReactNativeHapticFeedback from 'react-native-haptic-feedback';
import tw from 'twrnc';

type Props = {
  onPress: () => void;
  text: string;
  style?: StyleProp<ViewStyle>;
};

export const LightButton: React.FC<Props> = ({
  onPress,
  text,
  style = {},
}): JSX.Element => {
  return (
    <TouchableOpacity
      onPress={() => {
        RNReactNativeHapticFeedback.trigger('impactLight');
        onPress();
      }}
      style={[
        tw`flex w-full justify-center rounded-md border-transparent py-2 px-4 bg-white border border-emerald-600`,
        style,
      ]}>
      <Text style={tw`text-sm font-medium text-emerald-600 text-center`}>
        {text}
      </Text>
    </TouchableOpacity>
  );
};
