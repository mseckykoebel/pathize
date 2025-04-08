import React, { memo, ReactNode, useCallback } from "react";
import {
  View,
  StyleProp,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { trigger } from "react-native-haptic-feedback";
import { tw } from "../../lib";

import { ChevronRight } from "../icons/ChevronRight";
import { Header2 } from "../text/Header2";

type Props = {
  title: ReactNode | string;
  titleStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  padding?: boolean;
  itemIcon: ReactNode;
  badgeChild?: ReactNode;
  hapticFeedback?: boolean;
  chevronRight?: boolean;
  border?: boolean;
  buttonStyle?: StyleProp<ViewStyle>;
};

/**
 * @description title can be either a custom component, or a string to use the default text component
 */
export const ListItem: React.FC<Props> = memo(
  ({
    title,
    titleStyle,
    disabled = false,
    buttonStyle,
    onPress,
    onLongPress,
    itemIcon,
    badgeChild,
    hapticFeedback = true,
    chevronRight = true,
    border = false,
    padding = false,
  }) => {
    const handlePress = useCallback(() => {
      onPress();
    }, [onPress]);
    const handleLongPress = useCallback(() => {
      onLongPress && onLongPress();
    }, [onLongPress]);

    return (
      <TouchableOpacity
        disabled={disabled}
        onPress={() => {
          hapticFeedback && trigger("impactLight");
          handlePress();
        }}
        onLongPress={() => {
          hapticFeedback && trigger("impactLight");
          handleLongPress();
        }}
        style={[
          tw`rounded-lg h-auto`,
          padding && tw`py-3`,
          border ? tw`border border-zinc-300` : tw`border border-transparent`,
          buttonStyle,
        ]}
      >
        <View style={tw`flex flex-row items-center justify-center`}>
          {/* LEFT ICON */}
          <View style={tw`p-4`}>{itemIcon}</View>

          {/* CENTER TITLE AND ICON AREA */}
          <View style={tw`flex-1 pr-2 pl-2`}>
            {typeof title === "string" ? (
              <Header2 text={title} textStyle={[tw``, titleStyle]} />
            ) : (
              title
            )}
            {badgeChild && badgeChild}
          </View>

          {/* RIGHT SIDE */}
          {chevronRight && (
            <View style={tw`p-4`}>
              <ChevronRight size={18} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }
);

ListItem.displayName = "ListItem";
