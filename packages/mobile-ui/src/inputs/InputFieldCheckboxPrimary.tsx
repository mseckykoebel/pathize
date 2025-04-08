import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  Animated,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { trigger } from "react-native-haptic-feedback";

import { CheckBox } from "../checkbox/CheckBox";
import { tw } from "../../lib";
import { Header2 } from "../text/Header2";
import { Subheader } from "../text/Subheader";

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

type Props = {
  itemHeaderText: string;
  itemSubheaderText?: string;
  selected: boolean;
  onValueChange: () => void;
  disabled?: boolean;
  changeStyleIfSelected?: boolean;
  padding?: boolean;
  style?: StyleProp<ViewStyle>;
  headerTextStyle?: StyleProp<TextStyle>;
  subheaderTextStyle?: StyleProp<TextStyle>;
};

export const InputFieldCheckboxPrimary: React.FC<Props> = ({
  itemHeaderText,
  itemSubheaderText,
  selected,
  onValueChange,
  disabled = false,
  padding = false,
  changeStyleIfSelected = true,
  style = {},
  headerTextStyle = {},
  subheaderTextStyle = {},
}) => {
  const animatedValue = useRef(new Animated.Value(selected ? 1 : 0)).current;
  const [isInputSelected, setIsInputSelected] = useState(selected);

  const handleChange = useCallback(
    (selected: boolean) => {
      return Animated.timing(animatedValue, {
        toValue: selected ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    },
    [animatedValue]
  );

  useEffect(() => {
    handleChange(selected);
    setIsInputSelected(selected);
  }, [selected, handleChange]);

  // 0 is unchecked, 1 is checked
  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#DDDDDD", "#DDDDDD"], // zinc-300 unchecked, zinc-300 checked
  });

  // 0 is unchecked, 1 is checked
  const textColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#001325", "#7A7A7A"], // neutral-400 unchecked, slate-900 checked
  });

  const animatedTouchableOpacityStyle = {
    borderColor,
    color: textColor,
    borderWidth: 1,
  };

  const animatedTextStyle = {
    color: textColor,
  };

  return (
    <AnimatedTouchableOpacity
      disabled={disabled}
      onPress={() => {
        trigger("impactLight");
        onValueChange();
        if (!changeStyleIfSelected) return;
        setIsInputSelected(!isInputSelected); // update local state, this is what we care about ultimately
        handleChange(!isInputSelected);
      }}
      style={[
        tw`flex-row flex items-center justify-start rounded-lg border border-transparent w-full ${
          padding ? "my-1" : ""
        }}`,
        animatedTouchableOpacityStyle,
        style,
      ]}
    >
      {/* ON THE RIGHT, SHOW AN FA CHEVRON */}
      <CheckBox
        checked={isInputSelected}
        checkedBackgroundColor="bg-green-400"
        touchesEnabled={false}
        style={tw``}
      />
      {/* HEADER */}
      <View style={tw`flex flex-col my-3`}>
        <Header2
          text={itemHeaderText}
          textStyle={[
            tw`${isInputSelected ? "line-through" : ""}`,
            animatedTextStyle,
            headerTextStyle,
          ]}
        />
        {/* SUBHEADER */}
        {itemSubheaderText && (
          <Subheader
            text={itemSubheaderText}
            style={[tw`font-normal`, animatedTextStyle, subheaderTextStyle]}
          />
        )}
      </View>
    </AnimatedTouchableOpacity>
  );
};
