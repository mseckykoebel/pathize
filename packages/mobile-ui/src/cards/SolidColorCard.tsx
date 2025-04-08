import React, { ReactNode } from "react";
import { Text, View, StyleProp, ViewStyle, TextStyle } from "react-native";

import { tw } from "../../lib";

type Props = {
  text: string;
  backgroundColor: string;
  padding?: boolean;
  textStyle?: StyleProp<TextStyle>;
  bottomChild?: ReactNode;
  cardStyle?: StyleProp<ViewStyle>;
}

/**
 * @param backgroundColor - the background color of the card in the form of bg-<tw-color>
 */
export const SolidColorCard: React.FC<Props> = ({
  text,
  backgroundColor,
  padding = true,
  textStyle = {},
  bottomChild,
  cardStyle = {},
}) => {
  return (
    <View
      style={[
        cardStyle,
        tw`p-6 ${backgroundColor} rounded-lg flex-col justify-start items-start gap-4 my-3 ${
          padding ? "" : "my-3"
        }`,
      ]}
    >
      <View style={tw`flex flex-col justify-start items-start gap-2`}>
        {/* TOP SECTION */}
        <Text style={[tw`text-black text-sm font-normal`, textStyle]}>
          {text}
        </Text>
        {/* MIDDLE SECTION */}
        <View style={[tw``]}>{bottomChild}</View>
      </View>
    </View>
  );
};
