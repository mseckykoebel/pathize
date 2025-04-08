/* eslint-disable indent */
import React, { useEffect, useState, useRef } from "react";
import { Image, View, ViewStyle, StyleProp, Animated } from "react-native";
import { trigger } from "react-native-haptic-feedback";
import { tw } from "../../lib";

type Props = {
  touchesEnabled?: boolean;
  hapticFeedback?: boolean;
  padding?: boolean;
  checked: boolean;
  checkedBackgroundColor?: string;
  onValueChange?: () => void;
  style?: StyleProp<ViewStyle>;
};

export const CheckBox: React.FC<Props> = ({
  touchesEnabled = true,
  hapticFeedback = true,
  padding = true,
  checkedBackgroundColor = "bg-black",
  style = {},
  checked,
  onValueChange,
}) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const isInitialRender = useRef(true);
  const [displayChecked, setDisplayChecked] = useState(checked);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      setDisplayChecked(checked);
      return;
    }

    // Fade out
    Animated.timing(fadeAnim, {
      toValue: 0.5,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      // Update displayed state after checked
      setDisplayChecked(checked);

      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      fadeAnim.stopAnimation();
    };
  }, [checked, fadeAnim]);

  return (
    <View
      style={[
        tw`w-8 h-8 p-1 justify-center items-center gap-2.5 ${
          padding ? "m-3" : ""
        }`,
        style,
      ]}
      onTouchStart={
        touchesEnabled && onValueChange
          ? () => {
              onValueChange();
              hapticFeedback && trigger("impactLight");
            }
          : undefined
      }
    >
      <Animated.View
        style={[
          tw`p-0.5 justify-start items-start gap-2 flex`,
          { opacity: fadeAnim },
        ]}
      >
        {displayChecked ? (
          <View
            style={tw`p-0.5 ${checkedBackgroundColor} rounded justify-start items-start gap-2.5 flex border border-transparent`}
          >
            <Image
              source={{
                uri: "https://jupiter-dx.github.io/assets/check.png",
                cache: "force-cache",
              }}
              style={tw`w-4 h-4`}
              resizeMode="cover"
              alt="Checkbox input with black background if checked, and white background if unchecked"
            />
          </View>
        ) : (
          <View
            style={tw`p-0.5 justify-start items-start gap-2.5 flex rounded border border-zinc-300`}
          >
            <View style={tw`w-4 h-4 relative`} />
          </View>
        )}
      </Animated.View>
    </View>
  );
};
