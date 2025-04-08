import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  StyleProp,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { trigger } from "react-native-haptic-feedback";
import { tw } from "../../lib";

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedText = Animated.createAnimatedComponent(Text);

type Props = {
  onPress: () => void;
  text: string;
  padding?: boolean;
  paddingTop?: boolean;
  disabled?: boolean;
  opacity?: number;
  rounded?: "small" | "large";
  width?: "full" | "half";
  hapticFeedback?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const PrimaryButton: React.FC<Props> = ({
  onPress,
  text,
  padding = true,
  paddingTop = false,
  disabled = false,
  opacity = 100,
  rounded = "large",
  width = "full",
  hapticFeedback = true,
  loading = false,
  style = {},
  textStyle = {},
}): JSX.Element => {
  const animatedButtonValue = useRef(
    new Animated.Value(disabled ? 0 : 1)
  ).current; // 0 if disabled, 1 if enabled
  const animatedTextValue = useRef(
    new Animated.Value(disabled ? 0 : 1)
  ).current; // 0 if disabled, 1 if enabled

  // background of button
  const backgroundColor = animatedButtonValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#d4d4d8", "#0f172a"],
  });

  const animatedButtonStyle = {
    backgroundColor,
  };

  // color of text
  const color = animatedTextValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#a3a3a3", "#ffffff"],
  });

  const animatedTextStyle = {
    color,
  };

  useEffect(() => {
    if (disabled) {
      // go from 1 to 0, 300 duration, and useNativeDriver: false
      animatedButtonValue.stopAnimation(() => {
        Animated.timing(animatedButtonValue, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }).start();
      });
      animatedTextValue.stopAnimation(() => {
        Animated.timing(animatedTextValue, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }).start();
      });
    } else {
      // go from 0 to 1, 300 duration, and useNativeDriver: false
      animatedButtonValue.stopAnimation(() => {
        Animated.timing(animatedButtonValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }).start();
      });
      animatedTextValue.stopAnimation(() => {
        Animated.timing(animatedTextValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }).start();
      });
    }
  }, [animatedTextValue, animatedButtonValue, disabled]);

  return (
    <AnimatedTouchableOpacity
      disabled={disabled}
      onPress={() => {
        if (loading) {
          console.log("button is loading so nothing will happen...");
          return;
        }
        hapticFeedback && trigger("impactLight");
        onPress();
      }}
      style={[
        tw`${width === "full" ? "w-full" : "w-2/3 mx-auto"} h-12 px-5 py-3 ${
          rounded === "large" ? "rounded-3xl" : "rounded-lg"
        } flex-col justify-center items-center gap-1.5 opacity-${opacity} ${
          padding ? "my-3" : ""
        } ${paddingTop ? "mt-3" : ""}`,
        style,
        animatedButtonStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator size={"small"} />
      ) : (
        <AnimatedText
          style={[
            tw`text-base font-medium leading-normal`,
            disabled ? tw`text-neutral-400` : tw`text-white`,
            animatedTextStyle,
            textStyle,
          ]}
        >
          {text}
        </AnimatedText>
      )}
    </AnimatedTouchableOpacity>
  );
};
