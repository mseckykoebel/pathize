import React, { ReactNode } from "react";
import { StyleProp, Text, TextStyle, View, ViewStyle } from "react-native";
import { tw } from "../../lib";

type Props = {
  text: string;
  textSize?: "base" | "sm" | "md" | "xs";
  textColor?: string;
  rounded?: "small" | "large";
  badgeBorder?: boolean;
  badgeBorderColor?: string;
  badgeBackgroundColor?: string;
  iconChild?: ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

/**
 * @param badgeBorderColor must be a tailwind badge border color
 * @param textColor must be a tailwind text color
 */
export const Badge: React.FC<Props> = ({
  text,
  textSize = "sm",
  textColor = "text-neutral-500",
  badgeBorder = false,
  badgeBorderColor = "border-zinc-400",
  badgeBackgroundColor = "bg-gray-100",
  rounded = "large",
  iconChild,
  style = {},
  textStyle = {},
}): JSX.Element => {
  return (
    <View
      style={[
        tw`px-2 py-1 ${badgeBackgroundColor} ${
          badgeBorder ? `border ${badgeBorderColor}` : ""
        } ${
          rounded === "large" ? "rounded-3xl" : "rounded-lg"
        } flex-row justify-center items-center gap-1.5`,
        style,
      ]}
    >
      {iconChild ? (
        <>
          {iconChild}
          <Text
            style={[
              tw`${textColor} text-${textSize} font-medium leading-normal`,
              textStyle,
            ]}
          >
            {text}
          </Text>
        </>
      ) : (
        <Text
          style={[
            tw`${textColor} text-${textSize} font-medium leading-normal`,
            textStyle,
          ]}
        >
          {text}
        </Text>
      )}
    </View>
  );
};
