import React from "react";
import { StyleProp, Text, TextStyle } from "react-native";
import { tw } from "../../lib";

type Props = {
  text: string;
  padding?: boolean;
  paddingTop?: boolean;
  paddingBottom?: boolean;
  style?: StyleProp<TextStyle>;
}

export const Header1: React.FC<Props> = ({
  text,
  padding = false,
  paddingTop = false,
  paddingBottom = false,
  style = {},
}) => {
  return (
    <Text
      style={[
        tw`text-slate-900 text-[32px] font-normal leading-10 ${
          padding ? "my-3" : ""
        } ${paddingTop ? "mt-3" : ""} ${paddingBottom ? "mb-3" : ""}`,
        style,
      ]}
    >
      {text}
    </Text>
  );
};
