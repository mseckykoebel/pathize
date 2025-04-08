/* eslint-disable indent */
import React from "react";
import {
  StyleProp,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { trigger } from "react-native-haptic-feedback";
import { tw } from "../../lib";

type Props = {
  text: string;
  textColor?: "neutral" | "black" | "zinc";
  textType?: "base" | "medium";
  padding?: boolean;
  hapticFeedback?: boolean;
  onPress?: () => void;
  buttonStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}
const getTextColor = (textColor: Props["textColor"]) => {
  switch (textColor) {
    case "neutral":
      return "text-neutral-500";
    case "black":
      return "text-black";
    case "zinc":
      return "text-zinc-900";
    default:
      return "text-neutral-500";
  }
};

export const SubheaderPressable: React.FC<Props> = ({
  text,
  textColor = "neutral",
  textType = "base",
  onPress,
  hapticFeedback = true,
  padding = true,
  textStyle = {},
  buttonStyle = {},
}) => {
  return (
    <TouchableOpacity
      onPress={() => {
        hapticFeedback && trigger("impactLight", {});
        onPress && onPress();
      }}
      style={[tw`${padding ? "my-3" : ""}`, buttonStyle]}
    >
      <Text
        style={[
          tw`${getTextColor(textColor)} text-base leading-normal`,
          textStyle,
          textType === "medium" && {
            fontWeight: "500",
          },
        ]}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
};
