import React from "react";
import { StyleProp, Text, TextStyle } from "react-native";
import { tw } from "../../lib";

type Props = {
  text: string;
  padding?: boolean;
  textStyle?: StyleProp<TextStyle>;
}

export const Body1: React.FC<Props> = ({
  text,
  padding = false,
  textStyle = {},
}) => {
  return (
    <Text
      style={[
        tw`text-black text-sm leading-tight ${padding ? "my-3" : ""}`,
        textStyle,
        { flexShrink: 1 },
      ]}
    >
      {text}
    </Text>
  );
};
