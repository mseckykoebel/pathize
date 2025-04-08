import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Text,
  TouchableOpacity,
  Animated,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { trigger } from "react-native-haptic-feedback";

import { CheckBox } from "../checkbox/CheckBox";
import { tw } from "../../lib";

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedText = Animated.createAnimatedComponent(Text);

type Props = {
  itemText: string;
  selected: boolean;
  onValueChange: () => void;
  padding?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export const InputFieldCheckboxSecondary: React.FC<Props> = ({
  itemText,
  selected,
  onValueChange,
  padding = false,
  style = {},
  textStyle = {},
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

  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#DDDDDD", "#001325"], // zinc-300 and slate-900
  });

  // text color
  const textColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#7A7A7A", "#001325"], // neutral-400 and slate-900
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
      onPress={() => {
        trigger("impactLight");
        onValueChange();
        setIsInputSelected(!isInputSelected); // update local state, this is what we care about ultimately
        handleChange(!isInputSelected);
      }}
      style={[
        tw`flex-row flex items-center justify-between h-12 rounded-lg border-2 border-transparent w-full ${
          padding ? "my-1" : ""
        }}`,
        animatedTouchableOpacityStyle,
        style,
      ]}
    >
      <AnimatedText
        style={[tw`pl-2 font-medium`, animatedTextStyle, textStyle]}
      >
        {itemText}
      </AnimatedText>
      {/* ON THE RIGHT, SHOW AN FA CHEVRON */}
      <CheckBox checked={isInputSelected} touchesEnabled={false} style={tw``} />
    </AnimatedTouchableOpacity>
  );
};
