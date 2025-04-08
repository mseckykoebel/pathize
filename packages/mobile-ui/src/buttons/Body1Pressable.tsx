import React from "react";
import { StyleProp, Text, TextStyle, TouchableOpacity } from "react-native";
import { tw } from "../../lib";

type Props = {
  text: string;
  onPress?: () => void;
  padding?: boolean;
  textStyle?: StyleProp<TextStyle>;
}

export const Body1Pressable: React.FC<Props> = ({
  text,
  onPress,
  padding = false,
  textStyle = {},
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text
        style={[
          tw`text-black text-sm leading-tight underline ${padding ? "my-3" : ""}`,
          textStyle,
        ]}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
};
