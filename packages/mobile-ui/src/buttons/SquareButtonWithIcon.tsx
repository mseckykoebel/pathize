import React, { memo } from "react";
import { StyleProp, TouchableOpacity, View, ViewStyle } from "react-native";
import { IconDefinition } from "@fortawesome/fontawesome-common-types";
import { trigger } from "react-native-haptic-feedback";
import { PathizeIcon } from "../icons/PathizeIcon";
import { tw } from "../../lib";

/**
 * @description a pressable square button that renders an icon
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

export const SquareButtonWithIcon: React.FC<Props> = memo(
  ({
    onPress,
    hapticFeedback = true,
    icon,
    iconSize = 24,
    iconBorder = true,
    iconColor = "#002648",
    iconBackgroundColor = "bg-white",
    style = {},
  }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          hapticFeedback && trigger("impactLight");
          onPress();
        }}
        style={[
          tw`rounded-lg m-1 items-center h-30 border ${
            !iconBorder ? "border-transparent" : "border-zinc-300"
          }`,
          { width: "30%" },
          style,
        ]}
      >
        <View
          style={tw`rounded-lg flex flex-col items-center justify-center p-3 h-full w-full ${iconBackgroundColor}`}
        >
          <PathizeIcon icon={icon} iconColor={iconColor} size={iconSize} />
        </View>
      </TouchableOpacity>
    );
  }
);

SquareButtonWithIcon.displayName = "SquareButtonWithIcon";
