import React from "react";
import { StyleProp, Text, TextStyle } from "react-native";
import { tw } from "../../lib";

type Props = {
  text: string;
  padding?: boolean;
  textStyle?: StyleProp<TextStyle>;
}

export const Header3: React.FC<Props> = ({
  text,
  padding = false,
  textStyle = {},
}) => {
  return (
    <Text
      style={[
        tw`text-zinc-900 text-base font-bold leading-normal ${
          padding ? "my-3" : ""
        }`,
        textStyle,
      ]}
    >
      {text}
    </Text>
  );
};
