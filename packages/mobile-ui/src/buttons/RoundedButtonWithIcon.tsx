import React, { memo } from "react";
import { StyleProp, TouchableOpacity, View, ViewStyle } from "react-native";
import { IconDefinition } from "@fortawesome/fontawesome-common-types";
import { trigger } from "react-native-haptic-feedback";
import { PathizeIcon } from "../icons/PathizeIcon";
import { tw } from "../../lib";

/**
 * @description a pressable round button that renders an icon
 */
type Props = {
  onPress: () => void;
  iconColor?: string;
  iconSize?: number;
  iconBorder?: boolean;
  hapticFeedback?: boolean;
  iconBackgroundColor?: string;
  icon: IconDefinition;
  style?: StyleProp<ViewStyle>;
}

export const RoundedButtonWithIcon: React.FC<Props> = memo(
  ({
    onPress,
    hapticFeedback = true,
    icon,
    iconSize = 24,
    iconBorder = true,
    iconColor = "#9ca3af",
    iconBackgroundColor = "bg-gray-200",
    style = {},
  }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          hapticFeedback && trigger("impactLight");
          onPress();
        }}
        style={[style]}
      >
        <View
          style={tw`rounded-full flex flex-col items-center justify-center ${
            iconBorder ? "" : ""
          } p-2 ${iconBackgroundColor}`}
        >
          <PathizeIcon icon={icon} iconColor={iconColor} size={iconSize} />
        </View>
      </TouchableOpacity>
    );
  }
);

RoundedButtonWithIcon.displayName = "RoundedButtonWithIcon";
