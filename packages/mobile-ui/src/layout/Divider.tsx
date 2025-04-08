import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { tw } from "../../lib";

type Props = {
  padding?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const Divider: React.FC<Props> = ({ padding = false, style = {} }) => {
  return (
    <View
      style={[tw`border-b border-zinc-400 ${padding ? "my-3" : ""}`, style]}
    />
  );
};
