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
  onPress: () => void;
  text: string;
  padding?: boolean;
  disabled?: boolean;
  opacity?: number;
  rounded?: "small" | "large";
  width?: "full" | "half";
  hapticFeedback?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const SecondaryButton: React.FC<Props> = ({
  onPress,
  text,
  padding = true,
  disabled = false,
  opacity = 100,
  rounded = "large",
  width = "full",
  hapticFeedback = true,
  style = {},
  textStyle = {},
}): JSX.Element => {
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={() => {
        hapticFeedback && trigger("impactLight");
        onPress();
      }}
      style={[
        tw`${width === "full" ? "w-full" : "w-2/3 mx-auto"} h-12 px-5 py-3 ${
          disabled ? "bg-zinc-300" : "bg-white"
        } ${
          rounded === "large" ? "rounded-3xl" : "rounded-lg"
        } flex-col justify-center items-center gap-1.5 opacity-${opacity} ${
          padding ? "my-3" : ""
        }`,
        style,
      ]}
    >
      <Text
        style={[
          textStyle,
          disabled
            ? tw`text-neutral-400 text-base font-medium leading-normal`
            : tw`text-slate-900 text-base font-medium leading-normal`,
        ]}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
};
