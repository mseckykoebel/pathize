import React, { memo, ReactNode } from "react";
import { View, StyleProp, ViewStyle } from "react-native";
import { tw } from "../../lib";

type Props = {
  textChild: ReactNode;
  rightChild: ReactNode;
  border?: boolean;
  paddingSides?: boolean;
  padding?: boolean;
  rounded?: boolean;
  roundedTop?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const ListBox: React.FC<Props> = memo(
  ({
    textChild,
    rightChild,
    paddingSides = true,
    rounded = true,
    roundedTop = false,
    padding = false,
    border = true,
    style = {},
  }): JSX.Element => {
    return (
      <View
        style={[
          tw`w-full flex-row justify-between items-center h-12 ${
            paddingSides ? "p-2" : "py-3"
          } ${padding ? "my-3" : ""} ${rounded ? "rounded-lg" : ""} ${
            roundedTop ? "rounded-t-lg" : ""
          } ${border ? "border border-zinc-300" : ""} gap-2.5`,
          style,
        ]}
      >
        {/* ITEM ON THE LEFT */}
        <View style={tw`grow shrink basis-0`}>{textChild}</View>
        {/* ITEM ON THE RIGHT */}
        {rightChild}
      </View>
    );
  }
);

ListBox.displayName = "ListBox";
