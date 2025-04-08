import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleProp,
  TextStyle,
  ViewStyle,
} from "react-native";
import { trigger } from "react-native-haptic-feedback";
import { tw } from "../../lib";

type Props = {
  onPress: () => void;
  text: string;
  textColor?: string;
  padding?: boolean;
  hapticFeedback?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const TextButton: React.FC<Props> = ({
  onPress,
  text,
  textColor = "text-gray-700",
  hapticFeedback = true,
  padding = true,
  style = {},
  textStyle = {},
}): JSX.Element => {
  return (
    <TouchableOpacity
      style={[tw`${padding ? "my-1" : ""}`, style]}
      onPress={() => {
        hapticFeedback && trigger("impactLight");
        onPress();
      }}
    >
      <Text style={[tw`font-medium ${textColor}`, textStyle]}>{text}</Text>
    </TouchableOpacity>
  );
}
